import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import QuestionContentRenderer from "../components/QuestionContentRenderer";

const AIValidation = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState({ provider: "mock", hasApiKey: false, model: null });
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState("single");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQid, setSelectedQid] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [batchQids, setBatchQids] = useState([]);
  const [batchResults, setBatchResults] = useState([]);
  const [batchValidating, setBatchValidating] = useState(false);
  const [filters, setFilters] = useState({ subject: "", exam: "", chapter: "" });
  const [filterOptions, setFilterOptions] = useState({ subjects: [], exams: [], chapters: [] });
  const [filteredQuestions, setFilteredQuestions] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5002/api/ai/config").then(res => setConfig(res.data)).catch(() => {});
    axios.get("http://localhost:5002/api/questions", { params: { limit: 200 } }).then(res => setQuestions(res.data.questions || [])).catch(() => {});
    axios.get("http://localhost:5002/api/questions/meta/filters").then(res => {
      setFilterOptions({
        subjects: res.data.subjects || [],
        exams: res.data.exams || [],
        chapters: res.data.chapters || []
      });
    }).catch(() => {});
  }, []);

  const searchQuestions = questions.filter(q => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return String(q.qid).includes(term) || (q.question && q.question.toLowerCase().includes(term));
  });

  const loadQuestionDetails = (qid) => {
    setSelectedQid(qid);
    setResult(null);
    axios.get("http://localhost:5002/api/questions/" + qid).then(res => setSelectedQuestion(res.data)).catch(() => {});
  };

  const validateQuestion = async () => {
    if (!selectedQid) return;
    setValidating(true);
    setError(null);
    setResult(null);
    try {
      const res = await axios.post("http://localhost:5002/api/ai/validate/" + selectedQid);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setValidating(false);
    }
  };

  const toggleBatch = (qid) => {
    setBatchQids(prev => prev.includes(qid) ? prev.filter(x => x !== qid) : [...prev, qid]);
  };

  const validateBatch = async () => {
    if (batchQids.length === 0) return;
    setBatchValidating(true);
    setBatchResults([]);
    try {
      const res = await axios.post("http://localhost:5002/api/ai/validate-batch", { qids: batchQids });
      setBatchResults(res.data.results || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setBatchValidating(false);
    }
  };

  const applyFilters = () => {
    const params = {};
    if (filters.subject) params.subject = filters.subject;
    if (filters.exam) params.exam = filters.exam;
    if (filters.chapter) params.chapter = filters.chapter;
    axios.get("http://localhost:5002/api/questions", { params: { ...params, limit: 100 } })
      .then(res => setFilteredQuestions(res.data.questions || []))
      .catch(() => {});
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Validation</h1>
        <p className="text-gray-600 mt-1">Validate questions using AI with real PostgreSQL data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">AI Provider</div>
          <div className="text-lg font-semibold mt-1">{config.provider === "mock" ? "Mock (Simulated)" : "DeepSeek"}</div>
          <button onClick={() => navigate("/settings")} className="text-blue-600 text-sm mt-2">Change Provider</button>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Validation Progress</div>
          <div className="text-lg font-semibold mt-1">Ready</div>
          <div className="text-sm text-gray-600 mt-1">Select questions to validate</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Job Controls</div>
          <div className="flex gap-2 mt-2">
            <button disabled className="px-3 py-1 border border-gray-300 rounded text-sm">Start</button>
            <button disabled className="px-3 py-1 border border-gray-300 rounded text-sm">Pause</button>
            <button disabled className="px-3 py-1 border border-gray-300 rounded text-sm">Resume</button>
            <button disabled className="px-3 py-1 border border-gray-300 rounded text-sm">Terminate</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 flex">
          {["single", "batch", "filtered", "history"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={"px-6 py-3 text-sm font-medium " + (activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600")}>
              {tab === "single" ? "Single Question" : tab === "batch" ? "Batch Validation" : tab === "filtered" ? "Filtered Selection" : "Validation History"}
            </button>
          ))}
        </div>

        {activeTab === "single" && (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Question</label>
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by QID or question text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="max-h-64 overflow-auto border border-gray-200 rounded-lg">
                {searchQuestions.slice(0, 50).map(q => (
                  <div key={q.qid} onClick={() => loadQuestionDetails(q.qid)} className={"p-3 border-b cursor-pointer hover:bg-gray-50 " + (selectedQid == q.qid ? "bg-blue-50" : "")}>
                    <div className="font-medium text-sm">QID: {q.qid} | {q.subject}</div>
                    <div className="text-xs text-gray-600 truncate">{q.question}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={validateQuestion} disabled={!selectedQid || validating} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
                  {validating ? "Validating..." : "Validate Question"}
                </button>
                <button onClick={() => window.open("/questions", "_blank")} className="px-4 py-2 border border-gray-300 rounded-lg">View Full Record</button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4 max-h-80 overflow-auto">
                <div className="font-medium mb-2">Question Preview</div>
                {selectedQuestion ? (
                  <div className="space-y-2">
                    <div className="text-sm"><span className="font-medium">QID:</span> {selectedQuestion.qid}</div>
                    <div className="text-sm"><span className="font-medium">Subject:</span> {selectedQuestion.subject}</div>
                    <QuestionContentRenderer content={selectedQuestion.question} />
                    {selectedQuestion.options && <div className="text-sm">{selectedQuestion.options}</div>}
                    <div className="text-sm"><span className="font-medium">Stored Answer:</span> {selectedQuestion.answer_key || "N/A"}</div>
                  </div>
                ) : <div className="text-gray-500 text-sm">Select a question to preview</div>}
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="font-medium mb-2">AI Validation Result</div>
                {config.provider === "mock" && <div className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded mb-2">Mock Mode - Results are simulated</div>}
                {error && <div className="text-red-600 text-sm">{error}</div>}
                {result ? (
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Status:</span> {result.status}</div>
                    <div><span className="font-medium">Original Answer:</span> {result.storedAnswer || "N/A"}</div>
                    <div><span className="font-medium">AI Suggested Answer:</span> {result.aiDerivedAnswer || "N/A"}</div>
                    <div><span className="font-medium">Explanation:</span> {result.explanation}</div>
                    <div><span className="font-medium">Provider:</span> {result.provider} | Model: {result.model}</div>
                  </div>
                ) : <div className="text-gray-500 text-sm">Run validation to see results</div>}
              </div>
            </div>
          </div>
        )}

        {activeTab === "batch" && (
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-700">Selected: {batchQids.length} questions</div>
              <button onClick={validateBatch} disabled={batchQids.length === 0 || batchValidating} className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50">
                {batchValidating ? "Validating..." : "Start Batch Validation"}
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg max-h-96 overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Select</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">QID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Subject</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Question</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questions.map(q => (
                    <tr key={q.qid}>
                      <td className="px-4 py-2"><input type="checkbox" checked={batchQids.includes(q.qid)} onChange={() => toggleBatch(q.qid)} /></td>
                      <td className="px-4 py-2 text-sm">{q.qid}</td>
                      <td className="px-4 py-2 text-sm">{q.subject}</td>
                      <td className="px-4 py-2 text-sm max-w-md truncate">{q.question}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {batchResults.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="font-medium mb-2">Batch Results</div>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {batchResults.map((r, idx) => (
                    <div key={idx} className="flex justify-between text-sm p-2 border-b">
                      <span>QID: {r.qid}</span>
                      <span>Status: {r.status} {r.provider === "mock" && "(Mock)"}</span>
                      <span>Issues: {r.errors?.length || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "filtered" && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select value={filters.subject} onChange={(e) => setFilters({...filters, subject: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg">
                <option value="">All Subjects</option>
                {filterOptions.subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={filters.exam} onChange={(e) => setFilters({...filters, exam: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg">
                <option value="">All Exams</option>
                {filterOptions.exams.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
              <select value={filters.chapter} onChange={(e) => setFilters({...filters, chapter: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg">
                <option value="">All Chapters</option>
                {filterOptions.chapters.slice(0, 50).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={applyFilters} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Apply Filters</button>
            </div>
            <div className="text-sm text-gray-700">Found: {filteredQuestions.length} questions</div>
            <button onClick={() => { setBatchQids(filteredQuestions.map(q => q.qid)); setActiveTab("batch"); }} disabled={filteredQuestions.length === 0} className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50">Load to Batch Validation</button>
          </div>
        )}

        {activeTab === "history" && (
          <div className="p-6">
            <div className="text-gray-500 text-sm">Validation history will show completed jobs from the backend</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIValidation;
