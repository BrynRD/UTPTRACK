// frontend/components/Loading.tsx
export default function Loading() {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="text-gray-600 text-lg font-medium animate-pulse">
                Cargando datos...
            </div>
        </div>
    )
}