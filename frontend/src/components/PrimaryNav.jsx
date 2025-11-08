import { NavLink } from 'react-router-dom';

export default function PrimaryNav({ tabs = [], locationDescriptor = 'Browse' }) {

 return (
   <div className="border-b border-shell-border bg-shell-base/95">
     <nav className="mx-auto flex max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8" role="navigation" aria-label="Primary">
       {tabs.map((tab) => (
         <NavLink
           key={tab.to}
           to={tab.to}
           end={tab.to === '/'}
           className={({ isActive }) =>
             `group relative my-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/60 ${
               isActive
                 ? 'text-text-primary'
                 : 'text-text-muted hover:text-text-primary hover:bg-shell-surface/70'
             }`
           }
         >
           {({ isActive }) => (
             <>
               {tab.icon ? <tab.icon size={16} aria-hidden="true" /> : null}
               <span>{tab.label}</span>
               {isActive ? <span className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-accent" aria-hidden="true" /> : null}
             </>
           )}
         </NavLink>
       ))}

       <div className="ml-auto">
         <span className="text-xs uppercase tracking-[0.2em] text-text-muted">{locationDescriptor}</span>
       </div>
     </nav>
   </div>
 );
}
