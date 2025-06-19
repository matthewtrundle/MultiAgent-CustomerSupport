export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Vacation Rental Support AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/demo"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Try Demo
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Multi-Agent Vacation Rental Support
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Watch AI agents collaborate to solve host and guest issues in real-time. From calendar
              sync problems to refund disputes, see how specialized agents reduce resolution time by
              80%.
            </p>
            <div className="mt-8">
              <a
                href="/demo"
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
              >
                Try Interactive Demo →
              </a>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-blue-600 mb-4">
                <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Specialized Support Agents</h3>
              <p className="mt-2 text-gray-600">
                Expert agents for technical issues, billing disputes, platform features, and urgent
                escalations.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-green-600 mb-4">
                <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Visual Agent Collaboration</h3>
              <p className="mt-2 text-gray-600">
                Watch agents analyze problems, search knowledge bases, and break down complex issues
                in real-time.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-purple-600 mb-4">
                <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Knowledge Base Integration</h3>
              <p className="mt-2 text-gray-600">
                Agents leverage ML best practices, statistical methods, and platform documentation
                automatically.
              </p>
            </div>
          </div>

          <div className="mt-20 bg-white rounded-lg shadow p-8">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h4 className="font-semibold">Ticket Received</h4>
                <p className="text-sm text-gray-600 mt-2">Customer submits a support request</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h4 className="font-semibold">AI Analysis</h4>
                <p className="text-sm text-gray-600 mt-2">
                  Router agent classifies and prioritizes
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <h4 className="font-semibold">Agent Processing</h4>
                <p className="text-sm text-gray-600 mt-2">Specialized agent handles the issue</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">4</span>
                </div>
                <h4 className="font-semibold">QA & Response</h4>
                <p className="text-sm text-gray-600 mt-2">Quality checked and sent to customer</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p>&copy; 2024 Vacation Rental Support AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
