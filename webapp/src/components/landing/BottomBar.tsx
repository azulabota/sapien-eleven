type IconLink = {
  href: string;
  label: string;
  src: string;
};

const links: IconLink[] = [
  // TODO: swap hrefs to your real destinations
  { href: '#', label: 'Discord', src: '/icons/discord.svg' },
  { href: '#', label: 'Telegram', src: '/icons/telegram.png' },
  { href: '#', label: 'X', src: '/icons/x.svg' },
  { href: '#', label: 'GitBook', src: '/icons/gitbook.svg' },
  { href: '#', label: 'Team', src: '/icons/team.svg' },
  { href: '#', label: 'Whitepaper', src: '/icons/whitepaper.svg' },
];

export function BottomBar() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50"
      style={{
        background: 'rgba(8, 8, 8, 0.92)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(202, 60, 61, 0.10)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="h-14 flex items-center justify-between">
          {/* Left: icons (≈ 1/3 of the bar) */}
          <div
            className="flex items-center justify-between"
            style={{ width: '33.333%' }}
          >
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                aria-label={l.label}
                target={l.href.startsWith('http') ? '_blank' : undefined}
                rel={l.href.startsWith('http') ? 'noreferrer' : undefined}
                className="transition-opacity"
                style={{ opacity: 0.6 }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = '0.92')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = '0.6')}
              >
                <img
                  src={l.src}
                  alt=""
                  className="block"
                  style={{ width: 18, height: 18, objectFit: 'contain' }}
                />
              </a>
            ))}
          </div>

          {/* Right: intentionally empty for now (keeps layout future-proof) */}
          <div className="flex-1" />
        </div>
      </div>
    </div>
  );
}
