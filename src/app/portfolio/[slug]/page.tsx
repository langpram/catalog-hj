  // src/app/portfolio/[slug]/page.tsx - UPDATED DENGAN KATEGORI

  "use client";

  import { use, useEffect, useState } from "react";
  import { Portfolio } from "@/lib/types";
  import { marked } from "marked";
  import { useOfflineData } from "@/hooks/useOfflineData";

  export default function PortfolioDetailPage({
    params,
  }: {
    params: Promise<{ slug: string }>;
  }) {
    const { slug } = use(params);
    const { data: offlineData, isLoading, error } = useOfflineData();
    const [project, setProject] = useState<Portfolio | null>(null);
    const [otherProjects, setOtherProjects] = useState<Portfolio[]>([]);
    const [descriptionHtml, setDescriptionHtml] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
      if (offlineData?.portfolios) {
        const foundProject = offlineData.portfolios.find(
          (p) =>
            p.slug === slug ||
            p.slug === `project-${slug}` ||
            p.id.toString() === slug
        );

        if (foundProject) {
          setProject(foundProject);

          // Get other projects (same category if available, otherwise random)
          let others = offlineData.portfolios.filter(
            (p) => p.id !== foundProject.id
          );

          // Prioritize same category
          if (foundProject.Portfolio_Category) {
            const sameCategory = others.filter(
              (p) => p.Portfolio_Category === foundProject.Portfolio_Category
            );
            if (sameCategory.length > 0) {
              others = sameCategory;
            }
          }

          setOtherProjects(others.slice(0, 3));

          // Parse description
          if (foundProject.description) {
            const parseDescription = async () => {
              try {
                const html = await marked.parse(foundProject.description);
                setDescriptionHtml(html);
              } catch (error) {
                console.error("Error parsing markdown:", error);
                setDescriptionHtml(foundProject.description);
              }
            };
            parseDescription();
          }
        }
      }
    }, [offlineData, slug]);

    if (isLoading) {
      return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading project...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (!project && offlineData) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
              <a
                href="/portfolio"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Kembali ke Portfolio
              </a>
            </div>

            <div className="text-center py-12">
              <h1 className="text-3xl font-bold mb-4">Proyek Tidak Ditemukan</h1>
              <p className="text-gray-600 mb-6">
                Proyek dengan slug '{slug}' tidak ditemukan.
              </p>
              <a
                href="/portfolio"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Kembali ke Portfolio
              </a>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Back Button */}
          <div className="mb-6">
            <a
              href="/portfolio"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Kembali ke Portfolio
            </a>
          </div>

          {project && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {/* Image Gallery */}
                <div>
                  {project.pict && project.pict.length > 0 ? (
                    <div className="space-y-4">
                      {/* Main Image */}
                      <div className="aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                        <img
                          src={project.pict[currentImageIndex]}
                          alt={`${project.title} - ${currentImageIndex + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.src = "/images/placeholder.png";
                          }}
                        />
                      </div>

                      {/* Thumbnails */}
                      {project.pict.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                          {project.pict.map((image, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`aspect-square rounded-lg overflow-hidden transition-all ${
                                currentImageIndex === index
                                  ? "ring-2 ring-blue-500 shadow-md"
                                  : "ring-1 ring-gray-200 hover:ring-gray-300"
                              }`}
                            >
                              <img
                                src={image}
                                alt={`${project.title} thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const img = e.target as HTMLImageElement;
                                  img.src = "/images/placeholder.png";
                                }}
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg aspect-square flex items-center justify-center">
                      <span className="text-gray-400 text-6xl">📦</span>
                    </div>
                  )}
                </div>

                {/* Project Details */}
                <div className="flex flex-col pt-4">
                  {/* Badges */}
                  <div className="mb-4 flex items-center gap-2 flex-wrap">
                    {project.Big_project && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        ⭐ Proyek Unggulan
                      </span>
                    )}
                    {project.Portfolio_Category && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        🏷️ {project.Portfolio_Category}
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-6">
                    {project.title}
                  </h1>

                  <div className="mb-8">
                    {descriptionHtml ? (
                      <div
                        className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                        dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                      />
                    ) : (
                      <p className="text-gray-500 italic">
                        Tidak ada deskripsi untuk proyek ini.
                      </p>
                    )}
                  </div>

                  {/* Meta Info */}
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Jumlah Gambar
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {project.pict?.length || 0}
                      </p>
                    </div>
                    {project.createdAt && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Dibuat
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {new Date(project.createdAt).toLocaleDateString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Related Projects */}
              {otherProjects.length > 0 && (
                <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-center mb-8">
                    {project.Portfolio_Category
                      ? `Proyek Lainnya di ${project.Portfolio_Category}`
                      : "Proyek Lainnya"}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {otherProjects.map((otherProject) => (
                      <a
                        key={otherProject.id}
                        href={`/portfolio/${otherProject.slug || otherProject.id}`}
                        className="group relative block overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                      >
                        <div className="aspect-square relative bg-gray-100 dark:bg-gray-800">
                          {otherProject.imageUrl ? (
                            <>
                              <img
                                src={otherProject.imageUrl}
                                alt={otherProject.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                onError={(e) => {
                                  const img = e.target as HTMLImageElement;
                                  img.src = "/images/placeholder.png";
                                }}
                              />
                              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300"></div>
                              <div className="absolute inset-0 flex items-center justify-center p-4">
                                <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white tracking-wider uppercase text-center leading-tight">
                                  {otherProject.title}
                                </h3>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center justify-center h-full bg-gray-200 dark:bg-gray-700">
                              <div className="text-gray-400 text-4xl">📷</div>
                            </div>
                          )}
                        </div>
                        {otherProject.Portfolio_Category && (
                          <div className="absolute bottom-2 left-2 bg-white/80 text-gray-900 px-2 py-1 rounded text-xs font-semibold">
                            {otherProject.Portfolio_Category}
                          </div>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
