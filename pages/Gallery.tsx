import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { X } from "lucide-react";
import { useState } from "react";

export default function Gallery() {
  const { data: gallery = [], isLoading } = trpc.gallery.list.useQuery();
  const [selectedImage, setSelectedImage] = useState<any>(null);

  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-green-700 mb-3">
            المعرض الإعلامي          </h1>
          <p className="text-lg text-muted-foreground">
            استعرض لحظاتنا الجميلة من الورش والفعاليات
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
          </div>
        ) : gallery.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-lg text-muted-foreground">
              لا توجد صور مضافة حالياً
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((image) => (
              <div
                key={image.id}
                onClick={() => setSelectedImage(image)}
                className="group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition bg-white border border-gray-100"
              >
                <div className="relative overflow-hidden bg-muted h-48">
                  <img
                    src={image.imageUrl}
                    alt={image.titleAr}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1">{image.titleAr}</h3>
                  {image.descriptionAr && (
                    <p className="text-sm text-gray-500 line-clamp-2">{image.descriptionAr}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:bg-white/20 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image Container */}
            <div className="bg-black rounded-lg overflow-hidden">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.titleAr}
                className="w-full h-auto max-h-96 md:max-h-screen object-contain"
              />
            </div>

            {/* Image Info */}
            <div className="mt-4 text-white">
              <h2 className="text-2xl font-bold mb-2">{selectedImage.titleAr}</h2>
              {selectedImage.descriptionAr && (
                <p className="text-gray-300">{selectedImage.descriptionAr}</p>
              )}
            </div>

            {/* Navigation Arrows */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => {
                  const currentIndex = gallery.findIndex(
                    (img) => img.id === selectedImage.id
                  );
                  if (currentIndex > 0) {
                    setSelectedImage(gallery[currentIndex - 1]);
                  }
                }}
                className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition disabled:opacity-50"
                disabled={gallery.findIndex((img) => img.id === selectedImage.id) === 0}
              >
                السابقة
              </button>
              <span className="text-white">
                {gallery.findIndex((img) => img.id === selectedImage.id) + 1} /
                {gallery.length}
              </span>
              <button
                onClick={() => {
                  const currentIndex = gallery.findIndex(
                    (img) => img.id === selectedImage.id
                  );
                  if (currentIndex < gallery.length - 1) {
                    setSelectedImage(gallery[currentIndex + 1]);
                  }
                }}
                className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition disabled:opacity-50"
                disabled={
                  gallery.findIndex((img) => img.id === selectedImage.id) ===
                  gallery.length - 1
                }
              >
                التالية
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
