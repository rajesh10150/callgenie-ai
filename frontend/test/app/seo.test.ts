import sitemap, { siteUrl } from '@/app/sitemap';
import robots from '@/app/robots';
import { metadata } from '@/app/layout';

describe('app/sitemap', () => {
  it('lists the public marketing/auth routes with absolute URLs', () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toEqual([
      `${siteUrl}/`,
      `${siteUrl}/auth/login`,
      `${siteUrl}/auth/register`,
    ]);
    entries.forEach((e) => {
      expect(e.url.startsWith('http')).toBe(true);
      expect(e.lastModified).toBeInstanceOf(Date);
    });
    const home = entries.find((e) => e.url === `${siteUrl}/`);
    expect(home?.priority).toBe(1);
  });
});

describe('app/robots', () => {
  it('allows the root and disallows authenticated app routes', () => {
    const result = robots();
    const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules;
    expect(rule.userAgent).toBe('*');
    expect(rule.allow).toBe('/');
    expect(rule.disallow).toEqual(
      expect.arrayContaining(['/dashboard', '/leads', '/billing', '/settings'])
    );
    expect(result.sitemap).toBe(`${siteUrl}/sitemap.xml`);
    expect(result.host).toBe(siteUrl);
  });
});

describe('app/layout metadata', () => {
  it('exposes SEO metadata for sharing and indexing', () => {
    expect(metadata.metadataBase).toBeInstanceOf(URL);
    expect(metadata.openGraph?.siteName).toBe('CallGenie AI');
    expect(metadata.twitter).toMatchObject({ card: 'summary_large_image' });
    const robotsMeta = metadata.robots as { index?: boolean };
    expect(robotsMeta.index).toBe(true);
  });
});
