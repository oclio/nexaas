import pagesHelp from './pages-help';
import pagesLegal from './pages-legal';
import pagesMarketing from './pages-marketing';
import pagesProduct from './pages-product';

export default {
  ...pagesHelp,
  ...pagesLegal,
  ...pagesMarketing,
  ...pagesProduct,
} as const;
