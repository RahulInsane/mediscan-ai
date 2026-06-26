import { useState, useEffect } from "react"
import axios from "axios"

export default function App() {
  const [formData, setFormData] = useState({
    Pregnancies: "", Glucose: "", BloodPressure: "",
    SkinThickness: "", Insulin: "", BMI: "",
    DiabetesPedigreeFunction: "", Age: ""
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])
  const [page, setPage] = useState("predict")

  const fetchHistory = async () => {
    try {
      const res = await axios.get("https://mediscan-ai-muf8.onrender.com/history")
      setHistory(res.data)
    } catch (err) {
      console.error("Could not fetch history")
    }
  }

  useEffect(() => {
    if (page === "history") fetchHistory()
  }, [page])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const payload = Object.fromEntries(
        Object.entries(formData).map(([k, v]) => [k, parseFloat(v)])
      )
      const res = await axios.post("https://mediscan-ai-muf8.onrender.com/predict", payload)
      setResult(res.data)
    } catch (err) {
      setError("Something went wrong. Make sure the backend is running.")
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { name: "Pregnancies", label: "Pregnancies", placeholder: "e.g. 2" },
    { name: "Glucose", label: "Glucose (mg/dL)", placeholder: "e.g. 120" },
    { name: "BloodPressure", label: "Blood Pressure (mm Hg)", placeholder: "e.g. 70" },
    { name: "SkinThickness", label: "Skin Thickness (mm)", placeholder: "e.g. 20" },
    { name: "Insulin", label: "Insulin (mu U/ml)", placeholder: "e.g. 80" },
    { name: "BMI", label: "BMI", placeholder: "e.g. 28.5" },
    { name: "DiabetesPedigreeFunction", label: "Diabetes Pedigree Function", placeholder: "e.g. 0.5" },
    { name: "Age", label: "Age", placeholder: "e.g. 30" },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-sm font-bold">M</div>
          <span className="text-xl font-bold text-white">MediScan <span className="text-blue-400">AI</span></span>
          <div className="ml-auto flex gap-4">
            <button
              onClick={() => setPage("predict")}
              className={`text-sm px-4 py-1.5 rounded-lg transition ${page === "predict" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              Predict
            </button>
            <button
              onClick={() => setPage("history")}
              className={`text-sm px-4 py-1.5 rounded-lg transition ${page === "history" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              History
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Predict Page */}
        {page === "predict" && (
          <>
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold mb-3">Diabetes Risk Assessment</h1>
              <p className="text-gray-400 text-lg">Enter patient health parameters to predict diabetes risk using our trained ML model</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h2 className="text-lg font-semibold mb-6 text-blue-400">Patient Information</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm text-gray-400 mb-1">{field.label}</label>
                      <input
                        type="number"
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        required
                        step="any"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>
                  ))}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white font-semibold py-3 rounded-lg transition mt-2"
                  >
                    {loading ? "Analyzing..." : "Predict Risk"}
                  </button>
                </form>
              </div>

              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 flex flex-col justify-center">
                <h2 className="text-lg font-semibold mb-6 text-blue-400">Prediction Result</h2>
                {!result && !error && (
                  <div className="text-center text-gray-500 py-20">
                    <div className="text-5xl mb-4">🩺</div>
                    <p>Fill in the patient details and click Predict Risk to see the result</p>
                  </div>
                )}
                {error && (
                  <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-400">{error}</div>
                )}
                {result && (
                  <div className="space-y-6">
                    <div className={`rounded-xl p-6 text-center border ${result.prediction === 1 ? "bg-red-900/30 border-red-700" : "bg-green-900/30 border-green-700"}`}>
                      <div className="text-5xl mb-3">{result.prediction === 1 ? "⚠️" : "✅"}</div>
                      <div className={`text-2xl font-bold ${result.prediction === 1 ? "text-red-400" : "text-green-400"}`}>
                        {result.risk_level}
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">Diabetes Probability</span>
                        <span className="font-bold text-white">{result.probability}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${result.probability > 50 ? "bg-red-500" : "bg-green-500"}`}
                          style={{ width: `${result.probability}%` }}
                        />
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-5 text-sm text-gray-400">
                      <p className="font-semibold text-white mb-1">Disclaimer</p>
                      This tool is for educational purposes only and is not a substitute for professional medical advice.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* History Page */}
        {page === "history" && (
          <>
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold mb-3">Prediction History</h1>
              <p className="text-gray-400 text-lg">Last 20 predictions made using MediScan AI</p>
            </div>
            {history.length === 0 ? (
              <div className="text-center text-gray-500 py-20">No predictions yet. Make one first!</div>
            ) : (
              <div className="space-y-4">
                {history.map((record) => (
                  <div key={record.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${record.prediction === 1 ? "bg-red-900/50" : "bg-green-900/50"}`}>
                        {record.prediction === 1 ? "⚠️" : "✅"}
                      </div>
                      <div>
                        <div className={`font-semibold ${record.prediction === 1 ? "text-red-400" : "text-green-400"}`}>
                          {record.risk_level}
                        </div>
                        <div className="text-sm text-gray-400">
                          Glucose: {record.glucose} | BMI: {record.bmi} | Age: {record.age}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">{record.probability}%</div>
                      <div className="text-xs text-gray-500">
                        {new Date(record.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}