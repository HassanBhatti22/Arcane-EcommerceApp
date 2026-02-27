import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      {/* Newsletter */}
      <div className="border-b border-background/10">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-16 lg:py-24">
          <div className="flex flex-col lg:flex-row lg:items-end gap-8 lg:gap-16">
            <div className="flex-1">
              <p className="text-sm uppercase tracking-widest text-background/50 mb-3">
                Stay in the loop
              </p>
              <h3 className="font-display text-3xl lg:text-5xl font-bold leading-tight">
                Get 10% off your
                <br />
                first order.
              </h3>
            </div>
            <div className="flex-1 max-w-md">
              <div className="flex border-b border-background/30 pb-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 bg-transparent text-background placeholder:text-background/40 outline-none text-lg"
                />
                <button className="text-sm uppercase tracking-widest text-primary hover:text-background transition-colors font-bold">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-12 lg:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div>
            <h4 className="text-sm uppercase tracking-widest text-background/50 mb-6">
              Shop
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  href="/shop/electronics"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  Electronics
                </Link>
              </li>
              <li>
                <Link
                  href="/shop/fashion"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  Fashion
                </Link>
              </li>
              <li>
                <Link
                  href="/shop/home-living"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  Home & Living
                </Link>
              </li>
              <li>
                <Link
                  href="/shop/beauty"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  Beauty
                </Link>
              </li>
              <li>
                <Link
                  href="/shop/sports"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  Sports
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm uppercase tracking-widest text-background/50 mb-6">
              Help
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  href="/help/shipping"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link
                  href="/help/returns"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link
                  href="/help/faq"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/help/contact"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm uppercase tracking-widest text-background/50 mb-6">
              Company
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  href="/about"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/sustainability"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  Sustainability
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/press"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  Press
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm uppercase tracking-widest text-background/50 mb-6">
              Connect
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href="#"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  Twitter / X
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  Pinterest
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  TikTok
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 py-6 flex flex-col lg:flex-row items-center justify-between gap-4">
          <p className="text-background/40 text-sm">
            {"2026 ÉDIFICE. All rights reserved."}
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-background/40 hover:text-background text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-background/40 hover:text-background text-sm transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
