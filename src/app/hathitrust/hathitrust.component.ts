/*
IZ adds to custom.js the following:
window.IZ_CUSTOM_CONFIG = {
  linkWhitelist: [
    'special-collection-site.org',
    'another-example.net'
  ]
};
*/

import { Component, Input, OnInit, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

interface HathiResponse {
  items?: Array<{
    rightsCode: string;
    itemURL: string;
    usRightsString: string;
  }>;
  records?: Record<string, { recordURL: string }>;
}

@Component({
  selector: 'app-hathitrust',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hathitrust.component.html', 
  styleUrls: ['./hathitrust.component.scss']
})
export class HathiTrustComponent implements OnInit {
  @Input() item: any;
  
  public hathiUrl: string | null = null;
  public hathiDisplay:boolean = true;
  public isLoading: boolean = false;
  
  private elementRef = inject(ElementRef);

  ngOnInit(): void {
    //this.hathiDisplay=true;
    const domain = window.location.hostname;
    //Put institution-specific customizations set centrally here. IZ-set customizations override.
    if (domain.includes('placeholder')){
      this.hathiDisplay=true;
    }

    const localConfig=this.localParams();
    if (localConfig?.hathiDisplay === false){
      this.hathiDisplay=false;
      return;
    }
    this.processPnxRecord();
  }

  private localParams(): any {
    const localConfig = (window as any).IZ_CUSTOM_CONFIG;
    return localConfig;
  }

  processPnxRecord(): void {
    const nativeEl: HTMLElement = this.elementRef.nativeElement;
    const container = nativeEl.closest('nde-search-result-item-container');

    if (!container) {
      console.warn('HATHITRUST: Could not locate parent nde-search-result-item-container.');
      return;
    }

    // 1. Interrupt execution if the item already has an "Available Online" indicator/button
    // Adjust '.online' or '.available-online' to match the exact class Primo applies
    const hasOnlineLink = container.querySelector('.quicklink-container');
    
    if (hasOnlineLink) {
      console.log('HATHITRUST: Item already has full-text available online. Aborting HathiTrust check.');
      return;
    }

    // 2. Extract Doc ID from permalink
    const permalink = container.querySelector('a[href*="docid"]')?.getAttribute('href');
    if (!permalink) {
      console.warn('HATHITRUST: No permalink found inside container.');
      return;
    }

    const urlParams = new URLSearchParams(permalink.split('?')[1]);
    const docId = urlParams.get('docid');

    if (docId) {
      console.log('HATHITRUST: Fetching PNX for docid ->', docId);
      this.fetchPublicPnx(docId);
    }
  }

  fetchPublicPnx(docId: string): void {
    const vid = new URLSearchParams(window.location.search).get('vid') || '01BLC_NETWORK:NDE_UNION';
    const endpoint = `/primaws/rest/pub/pnxs/L/${encodeURIComponent(docId)}?vid=${encodeURIComponent(vid)}&lang=en`;

    fetch(endpoint)
      .then(res => res.json())
      .then(pnxData => {
        const rawOcn = pnxData?.pnx?.addata?.oclcid?.[0] || pnxData?.addata?.oclcid?.[0];
        
        if (rawOcn) {
          const cleanOcn = rawOcn.replace(/\D/g, '');
          console.log(`HATHITRUST: Raw OCN -> "${rawOcn}" | Clean OCN -> "${cleanOcn}"`);
          this.checkHathiTrust(cleanOcn);
        } else {
          console.log(`HATHITRUST: PNX loaded for ${docId}, but no oclcid found in addata.`);
        }
      })
      .catch(err => {
        console.error('HATHITRUST: Public PNX fetch failed:', err);
      });
  }

  checkHathiTrust(ocn: string): void {
    this.isLoading = true;
    const apiUrl = `https://catalog.hathitrust.org/api/volumes/brief/oclc/${ocn}.json`;

    console.log(`HATHITRUST: Querying API -> ${apiUrl}`);

    fetch(apiUrl)
      .then(res => res.json())
      .then((data: HathiResponse) => {
        console.log(`HATHITRUST API Response for OCN ${ocn}:`, data);

        if (!data.items || data.items.length === 0) {
          console.log(`HATHITRUST: Record found for ${ocn}, but items array is empty.`);
          return;
        }

        console.log(`HATHITRUST: Evaluating ${data.items.length} item(s) for OCN ${ocn}:`, data.items);

        // Check for full-view rights criteria
        const fullViewItem = data.items.find(
          item => item.rightsCode === 'pd' || item.rightsCode === 'pdus' || item.rightsCode === 'world' || item.usRightsString === 'Full View'
        );

        if (fullViewItem) {
          this.hathiUrl = this.prefix(fullViewItem.itemURL);
          console.log('HATHITRUST SUCCESS: Full text available at ->', this.hathiUrl);
        } else {
          console.log('HATHITRUST: Items found, but none matched Full View rights criteria (e.g. rightsCode is "ic"):', data.items);
        }
      })
      .catch(err => {
        console.error('HATHITRUST API Fetch Error:', err);
      })
      .finally(() => {
        this.isLoading = false;
    });
  }

  prefix(url: string): string {
  const domain = window.location.hostname;
  let prefix = '';

  if (domain.includes('uvm')) {
    prefix = '';
  } else if (domain.includes('middlebury')) {
    prefix = '';
  } else if (domain.includes('wesleyan')) {
    prefix = 'https://go.openathens.net/redirector/wesleyan.edu?url=';
  } else if (domain.includes('ctw-tc')) {
    prefix = '';
  } else if (domain.includes('blc-cc')) {
    prefix = '';
  }
  return prefix ? `${prefix}${encodeURIComponent(url)}` : url;
}
}