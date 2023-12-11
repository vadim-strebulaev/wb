import { SafeHtmlPipe } from './safe-html.pipe';

describe('SafeHtmlPipe', () => {
    it('create an instance', () => {
        const pipe = new SafeHtmlPipe({
            sanitize: () => 'safeString',
            bypassSecurityTrustHtml: () => 'safeString',
            bypassSecurityTrustResourceUrl: () => 'safeString',
            bypassSecurityTrustScript: () => 'safeString',
            bypassSecurityTrustStyle: () => 'safeString',
            bypassSecurityTrustUrl: () => 'safeString',
        });
    expect(pipe).toBeTruthy();
  });
});
