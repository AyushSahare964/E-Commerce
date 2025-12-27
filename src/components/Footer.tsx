import React from "react";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Github, 
  Linkedin, 
  Instagram, 
  ExternalLink,
  Code2,
  Cpu
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-white/5 bg-zinc-950 text-zinc-400">
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Brand & Developer Bio */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full border border-blue-600/30">
                <img 
                  src="https://i.pinimg.com/originals/39/21/bd/3921bd63ab5da1edd875c04c9bd08598.jpg" 
                  alt="Zentaro" 
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-2xl font-black uppercase italic tracking-tighter text-white">
                Zentaro
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              A premium commerce engine engineered by <strong>Ayush Sahare</strong>. 
              Merging the precision of Instrumentation Engineering with modern full-stack development.
            </p>
            <div className="flex gap-4">
              <a href="https://github.com/AyushSahare964" className="transition-colors hover:text-white">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="transition-colors hover:text-white">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="transition-colors hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Engineering Context */}
          <div>
            <h3 className="mb-6 font-bold uppercase tracking-widest text-white text-xs">Technical Stack</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-blue-500" />
                <span>React & TypeScript</span>
              </li>
              <li className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-500" />
                <span>Node.js Backend</span>
              </li>
              <li className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-blue-500" />
                <span>MySQL Database</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-6 font-bold uppercase tracking-widest text-white text-xs">Navigation</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-blue-500 transition-colors">Legendary Collections</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Flash Sales</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Privacy Protocol</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="mb-6 font-bold uppercase tracking-widest text-white text-xs">Contact Developer</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-blue-500" />
                <a href="mailto:ayush.sahare@vit.edu" className="hover:text-white">
                  ayush.sahare@vit.edu
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-blue-500" />
                <span>
                  Pune, Maharashtra<br />
                  VIT Pune Campus
                </span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-12 bg-white/5" />

        <div className="flex flex-col items-center justify-between gap-6 text-center text-[10px] uppercase tracking-[0.4em] md:flex-row md:text-left">
          <p className="text-zinc-500">
            © 2025 ZENTARO | Handcrafted by <span className="text-white font-black">Ayush Sahare</span>
          </p>
          <div className="flex gap-8 font-black text-zinc-600">
            <span>Instrumentation & Control Student</span>
            <span>VIT Pune</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;