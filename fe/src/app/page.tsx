import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'RoboClaim - AI-Powered File Analysis',
  description: 'Upload and analyze your files with advanced AI processing for intelligent data extraction and insights.',
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Analyze Files with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
              AI-Powered Processing
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Upload your files and let our advanced AI system extract valuable insights.
          </p>
          <Link 
            href="/login" 
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200"
          >
            Get started
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <FeatureCard
            icon="📄"
            title="PDF Processing"
            description="Extract text and data from PDF documents with high accuracy using advanced OCR technology."
          />
          <FeatureCard
            icon="🖼️"
            title="Image Analysis"
            description="Process images and extract text using state-of-the-art OCR technology."
          />
          <FeatureCard
            icon="📊"
            title="Spreadsheet Processing"
            description="Analyze CSV and Excel files to extract structured data and insights."
          />
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { 
  icon: string; 
  title: string; 
  description: string 
}) {
  return (
    <div className="p-6 rounded-lg bg-white/10 backdrop-blur-sm">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  )
}
