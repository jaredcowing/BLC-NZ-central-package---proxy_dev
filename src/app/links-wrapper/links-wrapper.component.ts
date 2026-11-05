/*
IZ adds to custom.js the following:
window.IZ_CUSTOM_CONFIG = {
  linkWhiteList: [
    'special-collection-site.org',
    'another-example.net'
  ]
};
*/

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-links-wrapper',
  standalone: true,
  imports: [CommonModule],
  template: '', 
})
export class LinksWrapperComponent implements OnInit, OnDestroy {
  private observer: MutationObserver | null = null;
  public linkWhiteList:string[] = [];

  ngOnInit() {
    const domain = window.location.hostname;
    //Put institution-specific customizations set centrally here. IZ-set customizations override.
    if (domain.includes('placeholder')){
      this.linkWhiteList=['something','else'];
    }
    
    const localConfig=this.localParams();
    if (Array.isArray(localConfig?.linkWhiteList)) {
      this.linkWhiteList = localConfig.linkWhiteList;
    }

    const nzCoreWhitelist = ['sourceRecord'];
    const nzDefaultWhitelist = ['wesscholar.edu', 'archive.org', ];
    const flexibleList = (this.linkWhiteList && this.linkWhiteList.length > 0) 
      ? this.linkWhiteList 
      : nzDefaultWhitelist;

    // Final Merge: Always include Core + the Flexible choice
    const allowedUrls = Array.from(new Set([...nzCoreWhitelist, ...flexibleList]));

    console.log("NZ ENGINE: Final Active Whitelist:", allowedUrls);    
    this.observer = new MutationObserver(() => {
      // 2. Target the links section specifically so we don't hide the whole page
      // 'prm-full-display-nodes-display' is the standard container for these sections
      const linksSection = document.querySelector('nde-full-display-links');

      if (linksSection) {
        const allLinks = linksSection.querySelectorAll('a');

        allLinks.forEach((link: HTMLAnchorElement) => {
          const href = link.href.toLowerCase();
          
          // Check against the merged NZ + IZ list
          const isAllowed = allowedUrls.some((pattern: string) => {
            const cleanPattern = pattern.trim();
            if (!cleanPattern) return false;

            // 1. Simple Substring Match (e.g. 'fdlp.gov', 'wesscholar.edu', 'archive.org')
            if (href.toLowerCase().includes(cleanPattern.toLowerCase())) {
              return true;
            }

            // 2. Raw Regex Match (e.g. '.*f.*gov.*', '^https://.*\\.library\\.edu')
            try {
              return new RegExp(cleanPattern, 'i').test(href);
            } catch {
              return false;
            }
          });

          if (href.includes('fdlp')) {
            console.log(`[DEBUG FDLP] URL: ${href} | Allowed: ${isAllowed} | Active Rules:`, allowedUrls);
          }

          if (!isAllowed) {
            // Target the list item to hide the whole row
            const container = link.closest('md-list-item') || 
                              link.closest('.prm-links-item') || 
                              link;
            
            if ((container as HTMLElement).style.display !== 'none') {
              (container as HTMLElement).style.display = 'none';
              console.log(`WHITE-LIST: Hid unauthorized link: ${href}`);
            }
          }
        });
      }
    });


    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private localParams(): any {
      const localConfig = (window as any).IZ_CUSTOM_CONFIG;
      return localConfig;
    }

  ngOnDestroy() {
    if (this.observer) this.observer.disconnect();
  }
}

