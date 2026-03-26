import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";

export default function SiteHeader() {
  const router = useRouter();
  const isHome = router.pathname === "/";
  const [activeKey, setActiveKey] = useState(isHome ? "amorce" : "");
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const navRef = useRef(null);
  const itemRefs = useRef({});

  const navItems = useMemo(
    () => [
      { key: "amorce", label: "Amorce", href: "/#amorce", sectionId: "amorce" },
      { key: "profil", label: "Profil", href: "/#profil", sectionId: "profil" },
      { key: "bts-sio", label: "BTS SIO", href: "/#bts-sio", sectionId: "bts-sio" },
      { key: "projet-pro", label: "Projet pro", href: "/#projet-pro", sectionId: "projet-pro" },
      {
        key: "projets-cours",
        label: "Projets de cours",
        href: "/#projets-cours",
        sectionId: "projets-cours",
      },
      {
        key: "projet-perso",
        label: "Projet perso",
        href: "/#projet-perso",
        sectionId: "projet-perso",
      },
      { key: "contact", label: "Contact", href: "/#contact", sectionId: "contact", isCta: true },
    ],
    []
  );

  useEffect(() => {
    if (!isHome) return;

    const sectionItems = navItems.filter((item) => item.sectionId);
    const sections = sectionItems
      .map((item) => ({
        key: item.key,
        element: document.getElementById(item.sectionId),
      }))
      .filter((entry) => entry.element);

    if (!sections.length) return;

    const updateFromScroll = () => {
      const y = window.scrollY + 140;
      let current = sections[0].key;
      for (const section of sections) {
        if (section.element.offsetTop <= y) {
          current = section.key;
        }
      }
      setActiveKey(current);
    };

    updateFromScroll();
    window.addEventListener("scroll", updateFromScroll, { passive: true });
    window.addEventListener("hashchange", updateFromScroll);
    return () => {
      window.removeEventListener("scroll", updateFromScroll);
      window.removeEventListener("hashchange", updateFromScroll);
    };
  }, [isHome, navItems, router.pathname]);

  const displayedActiveKey = isHome
    ? activeKey
    : router.pathname === "/projets/pro"
      ? "projet-pro"
      : "";

  useEffect(() => {
    const updateIndicator = () => {
      const navElement = navRef.current;
      const activeElement = itemRefs.current[displayedActiveKey];
      if (!navElement || !activeElement) {
        setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
        return;
      }

      const navRect = navElement.getBoundingClientRect();
      const activeRect = activeElement.getBoundingClientRect();
      setIndicatorStyle({
        left: activeRect.left - navRect.left,
        width: activeRect.width,
        opacity: 1,
      });
    };

    const rafId = requestAnimationFrame(updateIndicator);
    window.addEventListener("resize", updateIndicator);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateIndicator);
    };
  }, [displayedActiveKey]);

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link href="/#amorce" className="logo">
              Hugo Demoor
            </Link>
            <nav ref={navRef} className="nav">
              <span
                className="nav-indicator"
                style={{
                  left: `${indicatorStyle.left}px`,
                  width: `${indicatorStyle.width}px`,
                  opacity: indicatorStyle.opacity,
                }}
              />
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  ref={(element) => {
                    if (element) itemRefs.current[item.key] = element;
                  }}
                  className={`nav-link ${item.isCta ? "btn-contact" : ""} ${
                    displayedActiveKey === item.key ? "active" : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <div className="header-spacer" aria-hidden="true" />
    </>
  );
}