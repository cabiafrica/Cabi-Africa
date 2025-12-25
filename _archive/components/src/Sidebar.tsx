'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaTachometerAlt, FaCheckCircle, FaMoneyBillWave, FaQuestionCircle, FaStar, FaCar } from 'react-icons/fa';

const navItems = [
  { href: '/approvals', label: 'Approvals', icon: FaCheckCircle },
  { href: '/payouts', label: 'Payouts', icon: FaMoneyBillWave },
  { href: '/content/faq', label: 'FAQ Management', icon: FaQuestionCircle },
  { href: '/content/testimonials', label: 'Testimonials', icon: FaStar },
  { href: '/content/why-drive', label: 'Why Drive Page', icon: FaCar },
  { href: '/dashboard/mlm', label: 'MLM Dashboard', icon: FaTachometerAlt },
];


export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 text-2xl font-bold border-b border-gray-700">
        Admin Panel
      </div>
      <nav className="flex-grow p-4 space-y-4">
        <div>
          <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Manage</h3>
          <ul>
            {navItems.filter(i => ['/approvals', '/payouts'].includes(i.href)).map(item => (
              <NavItem key={item.href} item={item} pathname={pathname} />
            ))}
          </ul>
        </div>
        <div>
          <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Content</h3>
          <ul>
            {navItems.filter(i => i.href.startsWith('/content')).map(item => (
              <NavItem key={item.href} item={item} pathname={pathname} />
            ))}
          </ul>
        </div>
        <div>
          <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Dashboards</h3>
          <ul>
            {navItems.filter(i => i.href.startsWith('/dashboard')).map(item => (
              <NavItem key={item.href} item={item} pathname={pathname} />
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
};

const NavItem = ({ item, pathname }: { item: typeof navItems[0], pathname: string }) => {
  const isActive = pathname.startsWith(item.href);
  return (
    <li className="mb-1">
      <Link href={item.href}>
        <div
          className={`flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors ${
            isActive ? 'bg-gray-900' : ''
          }`}
        >
          <item.icon className="mr-3" />
          <span>{item.label}</span>
        </div>
      </Link>
    </li>
  );
};