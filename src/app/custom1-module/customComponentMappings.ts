//import { NewBooksComponent } from '../new-books/new-books.component';
import { LinksWrapperComponent } from '../links-wrapper/links-wrapper.component';
import { ExternalSearchComponent } from '../external-search/external-search.component';
import { HathiTrustComponent } from '../hathitrust/hathitrust.component';
// Define the map
export const selectorComponentMap = new Map<string, any>([
	['nde-full-display-links-before', LinksWrapperComponent],
	//['nde-landing-page-before', NewBooksComponent],
	['nde-quick-filters-after', ExternalSearchComponent],
	['nde-online-availability-after', HathiTrustComponent]
	//['prm-search-result-availability-line-after', HathiTrustComponent]
]);
