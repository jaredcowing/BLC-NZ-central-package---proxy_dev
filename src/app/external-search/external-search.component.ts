/*
IZ adds to custom.js the following:
window.IZ_CUSTOM_CONFIG = {
  linkWhitelist: [
    'special-collection-site.org',
    'another-example.net'
  ]
};
*/

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-external-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './external-search.component.html', 
  styleUrls: ['./external-search.component.scss']
})
export class ExternalSearchComponent implements OnInit{

  public gsSearchQuery: string = '';
  public wcdSearchQuery: string = '';
  public worldcatDisplay: boolean=true;
  public googleScholarDisplay: boolean=true;
  public domainWCD: string = 'uvm';
  ngOnInit() {
    //this.worldcatDisplay=true;
    //this.googleScholarDisplay=true;
    const domain = window.location.hostname;
    //Put institution-specific customizations set centrally here. IZ-set customizations override.
    if (domain.includes('uvm')){
      this.domainWCD='uvm';
    }
    else if (domain.includes('middlebury')){
      this.domainWCD='middlebury';
    }
    else if (domain.includes('blc-midd')){
      this.domainWCD='middlebury';
    }
    else if (domain.includes('wesleyan')){
      this.domainWCD='wesleyan';
    }
    else if (domain.includes('ctw-tc')){
      this.domainWCD='trincoll';
    }
    else if (domain.includes('blc-cc')){
      this.domainWCD='conncoll';
    }

    const localConfig=this.localParams();
    if (localConfig?.worldcatDisplay === false){
      this.worldcatDisplay=false;
    }
    if (localConfig?.googleScholarDisplay === false){
      this.googleScholarDisplay=false;
    }
    this.extractSearchQuery();
  }

  private localParams(): any {
    const localConfig = (window as any).IZ_CUSTOM_CONFIG;
    return localConfig;
  }

  openGoogleScholar(){
      //alert('Searching Google Scholar for: ' + this.currentSearchQuery);
      const url=`https://scholar.google.com/scholar?q=${encodeURIComponent(this.gsSearchQuery)}`;
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
      if (newWindow) {
        newWindow.focus();
      }
    }

    openWCD(){
      const domain = window.location.hostname;
      
      /*var domainWCD='uvm';
      if (domain.includes('uvm')){domainWCD='uvm';}
      else if (domain.includes('middlebury')){domainWCD='middlebury';}
      else if (domain.includes('wesleyan')){domainWCD='wesleyan';}
      else if (domain.includes('ctw-tc')){domainWCD='trincoll';}
      else if (domain.includes('blc-cc')){domainWCD='conncoll';}*/
      
      const url=`https://${this.domainWCD}.on.worldcat.org/search?queryString=${encodeURIComponent(this.wcdSearchQuery)}`;
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
      if (newWindow) {
        newWindow.focus();
      }
    }

  extractSearchQuery() {
    const urlParams = new URLSearchParams(window.location.search);
    const rawQuery = urlParams.get('query');
    if (rawQuery && rawQuery.includes(',')) {
      this.wcdSearchQuery=this.parseAdvancedWCD(rawQuery);
      this.gsSearchQuery =this.parseAdvancedGS(rawQuery);
      //this.currentSearchQuery = decodeURIComponent(rawQuery);
      console.log("EXTERNAL SEARCH: Found keywords:", this.gsSearchQuery);
    }
    else if (rawQuery ) {
      this.wcdSearchQuery = decodeURIComponent(rawQuery);
      this.gsSearchQuery = decodeURIComponent(rawQuery);
      console.log("EXTERNAL SEARCH: Found keywords:", this.gsSearchQuery);
    }
  }

  parseAdvancedGS(rawQuery: string): string {
    const segments = rawQuery.split(';');
    const terms: string[] = [];
    for (const segment of segments) {
      const parts = segment.split(',');
      if (parts.length >= 3 && parts[2]?.trim()) {
        terms.push(decodeURIComponent(parts[2].trim()));
      }
    }
    return terms.join(' ');
  }

  parseAdvancedWCD(rawQuery: string): string {
    const segments = rawQuery.split(';');
    const mappedTerms: string[] = [];

    for (const segment of segments) {
      const parts = segment.split(',');
      // Safety check: a valid Primo segment needs at least field, precision, and value
      if (parts.length >= 3) {
        const field = parts[0].trim().toLowerCase();
        const value = decodeURIComponent(parts[2].trim());
        if (!value) continue;

        let mappedTerm = '';
        if (field === 'creator') {
          mappedTerm = `au:"${value}"`;
        } else if (field === 'title') {
          mappedTerm = `ti:"${value}"`;
        } else if (field === 'any') {
          mappedTerm = `kw:"${value}"`;
        } else if (field === 'subject') {
          mappedTerm = `su:"${value}"`;
        } else if (field === 'isbn') {
          mappedTerm = `bn:"${value}"`;
        } else if (field === 'issn') {
          mappedTerm = `n2:"${value}"`;
        }

        mappedTerms.push(mappedTerm);
      }
    }
    return mappedTerms.join(' ');
  }
}

