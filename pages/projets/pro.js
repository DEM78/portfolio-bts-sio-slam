import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";

const demoUrl = "https://candidature.techinsight.fr/";
const repoUrl = "https://github.com/DEM78/Formateur-Test-App";
const repoOwner = "DEM78";
const repoName = "Formateur-Test-App";
const highlightedPaths = [
  "pages/api/generate-contract.js",
  "pages/api/extract-contract-fields.js",
  "components/formateur/Step4Contract.jsx",
  "components/formateur/useFormateurForm.js",
  "workers/document-verifier/src/index.js",
];
const workflowSteps = [
  {
    id: "01",
    title: "Etape CV",
    text: "Le formateur depose son CV, puis un Worker Cloudflare extrait automatiquement les donnees utiles pour pre-remplir le profil.",
  },
  {
    id: "02",
    title: "Etape documents",
    text: "Les fichiers justificatifs sont envoyes a un Worker qui analyse les pieces et verifie leur coherence.",
  },
  {
    id: "03",
    title: "Extraction + scraping",
    text: "Les informations formateur sont extraites des fichiers, puis les donnees employeur sont completees via scraping de societe.com.",
  },
  {
    id: "04",
    title: "Generation contrat",
    text: "Le contrat PDF est genere automatiquement avec les informations extraites et scrapees.",
  },
  {
    id: "05",
    title: "Retour cote admin",
    text: "Le dossier complet est renvoye cote administration pour validation et suivi.",
  },
];

function buildTree(paths) {
  const root = { type: "dir", name: "", path: "", children: [] };

  for (const fullPath of paths) {
    const parts = fullPath.split("/");
    let current = root;
    let currentPath = "";

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isFile = index === parts.length - 1;
      const wantedType = isFile ? "file" : "dir";

      let next = current.children.find(
        (child) => child.name === part && child.type === wantedType
      );
      if (!next) {
        next = { type: wantedType, name: part, path: currentPath, children: [] };
        current.children.push(next);
      }
      current = next;
    });
  }

  const sortNode = (node) => {
    node.children.sort((a, b) => {
      if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    node.children.forEach(sortNode);
  };

  sortNode(root);
  return root.children;
}

function flattenFiles(nodes) {
  const files = [];
  const walk = (list) => {
    for (const node of list) {
      if (node.type === "file") files.push(node.path);
      if (node.children?.length) walk(node.children);
    }
  };
  walk(nodes);
  return files;
}

function matchesHighlightedPath(filePath) {
  return highlightedPaths.includes(filePath);
}

function TreeNode({
  node,
  level,
  expandedDirs,
  onToggleDir,
  selectedFilePath,
  onSelectFile,
}) {
  if (node.type === "dir") {
    const isOpen = expandedDirs.has(node.path);
    return (
      <div>
        <button
          type="button"
          className="tree-row tree-dir"
          style={{ paddingLeft: `${10 + level * 14}px` }}
          onClick={() => onToggleDir(node.path)}
        >
          <span className="tree-arrow">{isOpen ? "v" : ">"}</span>
          <span className="tree-icon">[DIR]</span>
          <span>{node.name}</span>
        </button>
        {isOpen &&
          node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              level={level + 1}
              expandedDirs={expandedDirs}
              onToggleDir={onToggleDir}
              selectedFilePath={selectedFilePath}
              onSelectFile={onSelectFile}
            />
          ))}
      </div>
    );
  }

  const isSelected = selectedFilePath === node.path;
  return (
    <button
      type="button"
      className={`tree-row tree-file ${isSelected ? "is-active" : ""}`}
      style={{ paddingLeft: `${10 + level * 14}px` }}
      onClick={() => onSelectFile(node.path)}
    >
      <span className="tree-icon">[JS]</span>
      <span className="tree-name">{node.name}</span>
      {matchesHighlightedPath(node.path) && <span className="tree-badge">Cle</span>}
    </button>
  );
}

export default function ProjetProPage() {
  const [repoBranch, setRepoBranch] = useState("main");
  const [treeNodes, setTreeNodes] = useState([]);
  const [treeLoading, setTreeLoading] = useState(true);
  const [treeError, setTreeError] = useState("");
  const [expandedDirs, setExpandedDirs] = useState(
    new Set(["pages", "pages/api", "components", "components/formateur", "workers"])
  );
  const [selectedFilePath, setSelectedFilePath] = useState(
    "pages/api/generate-contract.js"
  );
  const [fileContent, setFileContent] = useState("");
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTree() {
      setTreeLoading(true);
      setTreeError("");

      const branches = ["main", "master"];
      let loaded = false;

      for (const branch of branches) {
        try {
          const res = await fetch(
            `https://api.github.com/repos/${repoOwner}/${repoName}/git/trees/${branch}?recursive=1`
          );
          if (!res.ok) continue;
          const data = await res.json();
          const paths = (data.tree || [])
            .filter((item) => item.type === "blob")
            .map((item) => item.path)
            .filter((path) => !path.startsWith("node_modules/"));

          if (cancelled) return;
          setRepoBranch(branch);
          setTreeNodes(buildTree(paths));
          loaded = true;
          break;
        } catch {
          // try next branch
        }
      }

      if (!loaded && !cancelled) {
        setTreeError("Impossible de charger l'arborescence GitHub pour le moment.");
      }
      if (!cancelled) setTreeLoading(false);
    }

    loadTree();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadFile() {
      if (!selectedFilePath) return;
      setFileLoading(true);
      setFileError("");

      try {
        const res = await fetch(
          `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${repoBranch}/${selectedFilePath}`
        );
        if (!res.ok) throw new Error("Fichier non disponible");
        const text = await res.text();
        if (cancelled) return;
        if (text.includes("\u0000")) {
          setFileError("Fichier binaire: affichage texte non supporte.");
          setFileContent("");
        } else {
          setFileContent(text);
        }
      } catch (error) {
        if (!cancelled) {
          setFileError(error.message || "Erreur de chargement du fichier.");
          setFileContent("");
        }
      } finally {
        if (!cancelled) setFileLoading(false);
      }
    }

    loadFile();
    return () => {
      cancelled = true;
    };
  }, [repoBranch, selectedFilePath]);

  const allFiles = useMemo(() => flattenFiles(treeNodes), [treeNodes]);

  useEffect(() => {
    if (!allFiles.length) return;
    if (!allFiles.includes(selectedFilePath)) {
      setSelectedFilePath(allFiles[0]);
    }
  }, [allFiles, selectedFilePath]);

  const selectedFileGithubUrl = selectedFilePath
    ? `${repoUrl}/blob/${repoBranch}/${selectedFilePath}`
    : repoUrl;

  const toggleDir = (dirPath) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      if (next.has(dirPath)) next.delete(dirPath);
      else next.add(dirPath);
      return next;
    });
  };

  const selectFile = (path) => {
    const parentDirs = path.split("/").slice(0, -1);
    let current = "";
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      parentDirs.forEach((part) => {
        current = current ? `${current}/${part}` : part;
        next.add(current);
      });
      return next;
    });
    setSelectedFilePath(path);
  };

  return (
    <>
      <Head>
        <title>Projet Pro | Portfolio BTS SIO SLAM</title>
        <meta
          name="description"
          content="Projet professionnel: application de gestion des formateurs, avec demo et extrait de code."
        />
      </Head>

      <SiteHeader />
      <main className="pro-page">
        <section className="pro-hero">
          <div className="pro-shell">
            <p className="pro-eyebrow">Projet professionnel - Stage 10 semaines</p>
            <h1>Application de gestion des formateurs</h1>
            <div className="pro-cta-row">
              <a className="pro-btn pro-btn-primary" href={demoUrl} target="_blank" rel="noreferrer">
                Ouvrir la demo
              </a>
              <a className="pro-btn pro-btn-secondary" href={repoUrl} target="_blank" rel="noreferrer">
                Voir tout le code (GitHub)
              </a>
              <Link className="pro-btn pro-btn-ghost" href="/">
                Retour page principale
              </Link>
            </div>
          </div>
        </section>

        <section className="pro-shell pro-workspace">
          <article className="pro-card preview-card">
            <h2>Preview application</h2>
            <div className="pro-preview">
              <iframe
                title="Apercu application candidature"
                src={demoUrl}
                loading="lazy"
                scrolling="no"
              />
            </div>
          </article>

          <article className="pro-card code-card">
            <h2>Explorateur de code</h2>
            <div className="code-head">
              <div>
                <p className="code-path">{selectedFilePath || "Aucun fichier selectionne"}</p>
                <p className="code-summary">
                  Arborescence complete du repo + affichage du fichier complet.
                </p>
              </div>
              <a href={selectedFileGithubUrl} target="_blank" rel="noreferrer">
                Ouvrir sur GitHub
              </a>
            </div>

            <div className="vscode-layout">
              <aside className="explorer-pane">
                <p className="pane-title">EXPLORER</p>
                {treeLoading && <p className="pane-note">Chargement de l&apos;arborescence...</p>}
                {!!treeError && <p className="pane-note pane-error">{treeError}</p>}
                {!treeLoading && !treeError && (
                  <div className="tree-scroll">
                    {treeNodes.map((node) => (
                      <TreeNode
                        key={node.path}
                        node={node}
                        level={0}
                        expandedDirs={expandedDirs}
                        onToggleDir={toggleDir}
                        selectedFilePath={selectedFilePath}
                        onSelectFile={selectFile}
                      />
                    ))}
                  </div>
                )}
              </aside>

              <section className="editor-pane">
                {fileLoading && <p className="pane-note">Chargement du fichier...</p>}
                {!!fileError && <p className="pane-note pane-error">{fileError}</p>}
                {!fileLoading && !fileError && (
                  <pre className="code-block">
                    <code>{fileContent}</code>
                  </pre>
                )}
              </section>
            </div>
          </article>
        </section>

        <section className="pro-shell pro-workflow-section">
          <article className="pro-card">
            <h2>Schema du process</h2>
            <p className="workflow-intro">
              Vue rapide des 5 etapes du flux de candidature.
            </p>
            <div className="workflow-flow">
              {workflowSteps.map((step) => (
                <div key={step.id} className="workflow-node">
                  <div className="workflow-circle">{step.id}</div>
                  <article className="workflow-bubble">
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </article>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </>
  );
}
