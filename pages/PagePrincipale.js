import Head from 'next/head';
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { useEffect, useRef, useState } from "react";

function ParticlesCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let mouse = { x: null, y: null };

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onMouseLeave = () => { mouse.x = null; mouse.y = null; };
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    const N = 85;
    const MAX_DIST = 140;
    const MOUSE_DIST = 180;

    const particles = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.2 + 0.4,
      blue: Math.random() < 0.12,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.18;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(148, 185, 255, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      if (mouse.x !== null) {
        for (const p of particles) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_DIST) {
            const alpha = (1 - dist / MOUSE_DIST) * 0.55;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(37, 99, 235, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        if (p.blue) {
          ctx.fillStyle = "rgba(59, 130, 246, 0.9)";
          ctx.shadowColor = "rgba(37, 99, 235, 0.8)";
          ctx.shadowBlur = 6;
        } else {
          ctx.fillStyle = "rgba(200, 220, 255, 0.55)";
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-canvas" />;
}

export default function PagePrincipale() {
  const stageDocuments = [
    {
      id: "conv-1",
      title: "Convention de stage 1",
      description: "Convention signee dans le cadre du stage professionnel.",
      href: "/documents-stage/convention-stage-1.pdf",
    },
    {
      id: "conv-2",
      title: "Convention de stage 2",
      description: "Seconde convention liee a l'organisation du stage.",
      href: "/documents-stage/convention-stage-2.pdf",
    },
    {
      id: "attest-caplogy",
      title: "Attestation de fin de stage CAPLOGY",
      description: "Document de fin de stage remis par l'entreprise d'accueil.",
      href: "/documents-stage/attestation-fin-stage-caplogy.pdf",
    },
    {
      id: "attest-fin",
      title: "Attestation de fin de stage",
      description: "Attestation complementaire associee a la periode de stage.",
      href: "/documents-stage/attestation-fin-stage.pdf",
    },
  ];

  const e5Documents = [
    {
      id: "tableau-synthese-e5",
      title: "Tableau de synthese E5",
      description: "Annexe 6-1 regroupant les realisations presentees pour l'epreuve E5 du BTS SIO.",
      href: "/documents-e5/tableau-synthese-e5.pdf",
    },
  ];

  const projetsCours = [
    {
      id: 1,
      titre: "Projet web Symfony",
      description: "Developpement et amelioration d'une application web de consultation de formations en ligne pour MediaTek86, avec organisation des contenus par playlists et categories, navigation cote utilisateur et espace d'administration securise.",
      objectifs: "Reprendre un projet existant, nettoyer le code, ajouter des fonctionnalites de consultation, de tri et de gestion des contenus, puis structurer un back office complet avec tests.",
      competences: "Developpement Symfony, gestion d'une base MySQL, creation d'un back office CRUD, tests PHPUnit et amelioration continue de la qualite du code.",
      techno: "Symfony / PHP / MySQL / Twig / PHPUnit / GitHub",
      lien: "https://github.com/DEM78/mediatekformation"
    },
    {
      id: 2,
      titre: "Projet desktop C#",
      description: "Evolution de MediaTekDocuments, une application metier de gestion documentaire pour MediaTek86, reposant sur une architecture 3 tiers avec client C#, API REST en PHP et base MySQL.",
      objectifs: "Faire evoluer une application existante en ajoutant la gestion des documents, des commandes, des exemplaires, de l'authentification et plusieurs regles metier liees aux droits et au suivi.",
      competences: "Developpement C# et PHP, conception et consommation d'API REST, gestion de base relationnelle, securisation des acces, tests et amelioration de la qualite logicielle.",
      techno: "C# / PHP / API REST / MySQL / Postman / SonarQube",
      statut: "Projet encore en cours de developpement. Aucun lien GitHub public pour le moment."
    }
  ];

  const [accordionOpen, setAccordionOpen] = useState(null);
  const toggleAccordion = (key) =>
    setAccordionOpen((prev) => (prev === key ? null : key));

  const epreuves = [
    {
      key: "e5",
      label: "E5",
      title: "Support et mise à disposition de services informatiques",
      meta: "Bloc n°1 · Coef. 4 · Oral ponctuel · 40 min",
      content: (
        <>
          <p>L&apos;épreuve E5 évalue l&apos;aptitude à mobiliser les compétences du <strong>bloc 1</strong> — Support et mise à disposition de services informatiques.</p>
          <h5>Le dossier numérique comprend :</h5>
          <ul>
            <li>Un support type <strong>portfolio</strong> retraçant le parcours de professionnalisation et décrivant les réalisations professionnelles de la formation. Les réalisations doivent, dans leur ensemble, mobiliser <strong>toutes les compétences du bloc 1</strong>.</li>
            <li>Pour chaque réalisation, les <strong>compétences mobilisées</strong> sont précisées.</li>
            <li>Un <strong>tableau de synthèse</strong> récapitulant l&apos;ensemble des réalisations présentées dans le portfolio.</li>
            <li>Les <strong>attestations de stage</strong> ou certificats de travail.</li>
          </ul>
          <details className="stage-documents">
            <summary className="stage-documents-summary">
              <div>
                <span className="stage-documents-kicker">Document E5</span>
                <span className="stage-documents-title">Tableau de synthese telechargeable</span>
              </div>
              <span className="stage-documents-hint">Afficher le PDF</span>
            </summary>
            <div className="stage-documents-body">
              <p className="stage-documents-intro">
                Document annexe associe a l'epreuve E5, accessible en consultation ou telechargement.
              </p>
              <div className="stage-documents-grid">
                {e5Documents.map((document) => (
                  <a
                    key={document.id}
                    href={document.href}
                    download
                    className="stage-document-card"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="stage-document-type">PDF</span>
                    <span className="stage-document-name">{document.title}</span>
                    <span className="stage-document-desc">{document.description}</span>
                    <span className="stage-document-link">Telecharger</span>
                  </a>
                ))}
              </div>
            </div>
          </details>
        </>
      ),
    },
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <Head>
        <title>Hugo Demoor — Portfolio BTS SIO SLAM</title>
        <meta name="description" content="Portfolio de Hugo Demoor, étudiant en BTS SIO SLAM" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <SiteHeader />

      <main>
        {/* SECTION AMORCE / HERO */}
        <section id="amorce" className="hero hero--particles">
          <ParticlesCanvas />
          <div className="hero-overlay" aria-hidden="true" />
          <div className="container">
            <div className="hero-content">
              <div className="hero-badge">BTS SIO SLAM</div>
              <h1 className="hero-title">Hugo Demoor</h1>
              <p className="hero-subtitle">Portfolio</p>
              <p className="hero-text">Développeur web.</p>
              <div className="hero-ctas">
                <button onClick={() => scrollToSection('projet-pro')} className="btn btn-primary">
                  Voir mes projets
                </button>
                <button onClick={() => scrollToSection('contact')} className="btn btn-secondary">
                  Me contacter
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION PROFIL */}
        <section id="profil" className="section">
          <div className="container">
            <div className="section-label">01 — Profil</div>
            <h2 className="section-title">Profil</h2>
            <div className="profil-content">
              <div className="profil-photo">
                <div className="photo-placeholder">HD</div>
              </div>
              <div className="profil-info">
                <p className="profil-text">19 ans — Rambouillet (78)</p>
                <p className="profil-text"><strong>Formations :</strong></p>
                <p className="profil-text">1<sup>re</sup> année : ENSITECH (Montigny-le-Bretonneux)</p>
                <p className="profil-text">2<sup>e</sup> année : BTS SIO SLAM — CNED</p>

                <div className="tags">
                  <span className="tag">JavaScript</span>
                  <span className="tag">PHP</span>
                  <span className="tag">SQL</span>
                  <span className="tag">Git</span>
                  <span className="tag">API REST</span>
                  <span className="tag">Symfony</span>
                  <span className="tag">Azure</span>
                  <span className="tag">Linux/VM</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION BTS SIO */}
        <section id="bts-sio" className="section section-alt">
          <div className="container">
            <div className="section-label">02 — Formation</div>
            <h2 className="section-title">BTS SIO</h2>
            <p className="bts-intro">
              Le <strong>BTS Services Informatiques aux Organisations</strong> est un diplôme de niveau Bac+2 qui forme aux métiers de l&apos;informatique. Il propose deux spécialisations selon le profil visé.
            </p>

            {/* Deux spé */}
            <div className="bts-spe-grid">
              <div className="bts-spe-card bts-spe-card--active">
                <div className="bts-spe-header">
                  <span className="bts-spe-badge">Ma spécialité</span>
                  <h3>SLAM</h3>
                  <p className="bts-spe-full">Solutions Logicielles et Applications Métiers</p>
                </div>
                <p className="bts-spe-desc">
                  Orientée développement, la spécialité SLAM forme à la conception et à la réalisation d&apos;applications. Elle couvre la programmation, les bases de données, les API et le déploiement d&apos;applications métiers.
                </p>
                <div className="bts-spe-tags">
                  <span className="tag">Développement</span>
                  <span className="tag">Base de données</span>
                  <span className="tag">API REST</span>
                  <span className="tag">POO</span>
                </div>
              </div>

              <div className="bts-spe-card">
                <div className="bts-spe-header">
                  <h3>SISR</h3>
                  <p className="bts-spe-full">Solutions d&apos;Infrastructure, Systèmes et Réseaux</p>
                </div>
                <p className="bts-spe-desc">
                  Orientée infrastructure, la spécialité SISR forme à l&apos;administration des réseaux, à la gestion des serveurs et à la cybersécurité. Elle couvre la virtualisation, les systèmes d&apos;exploitation et la supervision réseau.
                </p>
                <div className="bts-spe-tags">
                  <span className="tag">Réseaux</span>
                  <span className="tag">Serveurs</span>
                  <span className="tag">Cybersécurité</span>
                  <span className="tag">Virtualisation</span>
                </div>
              </div>
            </div>

            {/* Épreuves accordion */}
            <div className="bts-epreuves">
              <h3 className="bts-epreuves-title">Épreuves professionnelles</h3>
              <div className="accordion">
                {epreuves.map((ep) => (
                  <div
                    key={ep.key}
                    className={`accordion-item ${accordionOpen === ep.key ? "accordion-item--open" : ""}`}
                  >
                    <button
                      className="accordion-trigger"
                      onClick={() => toggleAccordion(ep.key)}
                      aria-expanded={accordionOpen === ep.key}
                    >
                      <div className="accordion-trigger-left">
                        <span className="accordion-epreuve-badge">{ep.label}</span>
                        <div className="accordion-trigger-text">
                          <span className="accordion-trigger-title">{ep.title}</span>
                          <span className="accordion-trigger-meta">{ep.meta}</span>
                        </div>
                      </div>
                      <span className="accordion-chevron" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </button>
                    <div className="accordion-body">
                      <div className="accordion-content">
                        {ep.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bts-video-placeholder">
              <div className="bts-video-frame">
                <video
                  className="bts-video-player"
                  controls
                  preload="metadata"
                >
                  <source src="/presentation-stage.mp4" type="video/mp4" />
                  Votre navigateur ne prend pas en charge la lecture de cette video.
                </video>
              </div>
              <div className="bts-video-caption">
                <p className="bts-video-label">Video de presentation</p>
                <p className="bts-video-sub">Presentation du stage et du projet professionnel</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION PROJET PRO */}
        <section id="projet-pro" className="section">
          <div className="container">
            <div className="section-label">03 — Expérience</div>
            <h2 className="section-title">Projet professionnel</h2>
            <p className="section-subtitle">Stage de 10 semaines · CAPLOGY · NOVATIEL · Vélizy</p>

            <div className="projet-main-card">
              <h3>Application de gestion des formateurs</h3>
              <p className="projet-description">
                Ma mission était de construire un parcours de candidature formateur complet : collecte des informations, contrôles automatiques des pièces et génération du contrat final avec des données consolidées.
              </p>

              <div className="projet-features">
                <h4>Ce que j&apos;ai développé :</h4>
                <ul>
                  <li>Extraction automatique du CV via un Worker Cloudflare</li>
                  <li>Vérification des documents justificatifs via Workers</li>
                  <li>Extraction des informations administratives formateur</li>
                  <li>Récupération des données employeur via scraping (societe.com)</li>
                  <li>Génération automatique du contrat PDF pré-rempli</li>
                </ul>
              </div>

              <div className="projet-mini-cards">
                <div className="mini-card">
                  <h5>Automatisation documentaire</h5>
                  <p>Traitement OCR, vérification et retour de données exploitables pour le front</p>
                </div>
                <div className="mini-card">
                  <h5>Workflow admin</h5>
                  <p>Consolidation des données puis envoi d&apos;un dossier exploitable côté administration</p>
                </div>
              </div>

              <div className="entreprise-info">
                <h4>Technologies mobilisées</h4>
                <ul>
                  <li>Next.js / React pour le front et les API routes</li>
                  <li>Cloudflare Workers pour extraction et vérification OCR</li>
                  <li>PDF-lib pour la génération du contrat final</li>
                </ul>
              </div>

              <details className="stage-documents">
                <summary className="stage-documents-summary">
                  <div>
                    <span className="stage-documents-kicker">Documents lies au stage</span>
                    <span className="stage-documents-title">Conventions et attestations telechargeables</span>
                  </div>
                  <span className="stage-documents-hint">Afficher les PDF</span>
                </summary>
                <div className="stage-documents-body">
                  <p className="stage-documents-intro">
                    Documents administratifs du stage mis a disposition de maniere discrete pour consultation ou telechargement.
                  </p>
                  <div className="stage-documents-grid">
                    {stageDocuments.map((document) => (
                      <a
                        key={document.id}
                        href={document.href}
                        download
                        className="stage-document-card"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span className="stage-document-type">PDF</span>
                        <span className="stage-document-name">{document.title}</span>
                        <span className="stage-document-desc">{document.description}</span>
                        <span className="stage-document-link">Telecharger</span>
                      </a>
                    ))}
                  </div>
                </div>
              </details>

              <Link href="/projets/pro" className="btn btn-primary btn-link">
                Voir détails
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION PROJETS DE COURS */}
        <section id="projets-cours" className="section section-alt">
          <div className="container">
            <div className="section-label">04 — Formation</div>
            <h2 className="section-title">Projets de cours</h2>
            <div className="projets-grid">
              {projetsCours.map((projet) => (
                <div key={projet.id} className="projet-card">
                  <div className="projet-card-num">0{projet.id}</div>
                  <h3>{projet.titre}</h3>
                  <p className="projet-card-desc">{projet.description}</p>
                  <div className="projet-card-details">
                    <p><strong>Objectifs :</strong> {projet.objectifs}</p>
                    {projet.competences && (
                      <p><strong>Competences :</strong> {projet.competences}</p>
                    )}
                    {projet.statut && (
                      <p><strong>Statut :</strong> {projet.statut}</p>
                    )}
                    <span className="tag">{projet.techno}</span>
                    {projet.lien && (
                      <a
                        href={projet.lien}
                        className="projet-card-link"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Voir le depot GitHub
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION PROJET PERSO */}
        <section id="projet-perso" className="section section-alt">
          <div className="container">
            <div className="section-label">05 — Personnel</div>
            <h2 className="section-title">Projet personnel</h2>
            <div className="projet-perso-card">
              <h3>Portfolio musical autour de FL Studio</h3>
              <p className="projet-description">
                Un site personnel construit autour de ma passion pour la musique et la production sur FL Studio, pense comme une vitrine artistique et technique.
              </p>
              <div className="projet-perso-elements">
                <div className="element">
                  <h4>Extraits et univers</h4>
                  <p>Presentation de mes morceaux, de mon identite visuelle et de mon univers musical.</p>
                </div>
                <div className="element">
                  <h4>Donnees via API</h4>
                  <p>Requetes API pour recuperer des statistiques comme les vues et les abonnes de mes plateformes.</p>
                </div>
                <div className="element">
                  <h4>Boutique drumkits</h4>
                  <p>Une page boutique dediee a la presentation et a la vente de drumkits lies a mon activite musicale.</p>
                </div>
              </div>
              <p className="section-subtitle" style={{ marginBottom: 0 }}>
                Projet encore en cours de developpement : il n&apos;est pas termine, donc pas encore heberge ni publie sur GitHub.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER / CONTACT */}
        <footer id="contact" className="footer">
          <div className="container">
            <h2 className="footer-title">Contact</h2>
            <p className="footer-email">
              <a href="mailto:demoorhugo@gmail.com">demoorhugo@gmail.com</a> —{" "}
              <a href="tel:+33761514961">07 61 51 49 61</a>
            </p>
            <div className="footer-links">
              <a href="https://github.com/DEM78" className="social-link" aria-label="GitHub" target="_blank" rel="noreferrer">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/hugo-demoor/" className="social-link" aria-label="LinkedIn" target="_blank" rel="noreferrer">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
            <p className="footer-signature">Hugo Demoor — Rambouillet</p>
          </div>
        </footer>
      </main>
    </>
  );
}


