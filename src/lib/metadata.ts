export function pageHead(title: string, description: string) {
  return { meta: [{ title: `${title} — VTweaks` }, { name: 'description', content: description }, { property: 'og:title', content: `${title} — VTweaks` }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] };
}
