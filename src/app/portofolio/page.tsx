import { getPortfolioProjects } from "@/lib/api";

export default async function PortofolioPage() {
  const projects = await getPortfolioProjects();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-4 sm:px-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6">
          Portofolio
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Kumpulan proyek kreatif yang telah saya kerjakan dengan penuh dedikasi dan passion.
        </p>
      </div>

      {/* Grid Card */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group relative bg-white rounded-2xl lg:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2"
            >
              {/* Square Image Container */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Overlay - always visible */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Title overlay - always visible */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  <h2 className="text-white font-bold text-lg sm:text-xl lg:text-2xl drop-shadow-lg leading-tight">
                    {project.title}
                  </h2>
                  
                  {/* Decorative element - always visible */}
                  <div className="w-12 h-1 bg-white/60 mt-2" />
                </div>
                
                {/* Corner accent - always visible */}
                <div className="absolute top-4 right-4 w-3 h-3 bg-white/30 rounded-full" />
              </div>
              
              {/* Subtle border effect - always visible */}
              <div className="absolute inset-0 rounded-2xl lg:rounded-3xl ring-1 ring-black/10" />
            </div>
          ))}
        </div>
      </div>

      {/* Empty state fallback */}
      {projects.length === 0 && (
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-200 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Belum Ada Proyek</h3>
          <p className="text-gray-600">Portfolio sedang dalam tahap pengembangan. Silakan kembali lagi nanti!</p>
        </div>
      )}
    </div>
  );
}