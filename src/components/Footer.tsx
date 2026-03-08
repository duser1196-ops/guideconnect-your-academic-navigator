import { GraduationCap, Github, Twitter, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <Link to="/" className="flex items-center gap-2.5 mb-4">
            <div className="gradient-primary rounded-lg p-1.5">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold gradient-text">GuideConnect</span>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A smart academic platform connecting students with the right faculty for project guidance.
          </p>
        </div>

        {[
          { title: "Platform", links: [{ label: "Features", href: "/#features" }, { label: "How It Works", href: "/#how-it-works" }, { label: "Roles", href: "/#roles" }] },
          { title: "Access", links: [{ label: "Login", href: "/login" }, { label: "Register", href: "/register" }, { label: "Dashboard", href: "/dashboard" }] },
          { title: "Team", links: [{ label: "D. Charan", href: "#" }, { label: "D. Rihika", href: "#" }, { label: "M. Akshay", href: "#" }] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="font-display font-semibold text-sm mb-4">{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">© 2026 GuideConnect. Built by D. Charan, D. Rihika & M. Akshay.</p>
        <div className="flex gap-4">
          {[Github, Twitter, Linkedin].map((Icon, i) => (
            <a key={i} href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
