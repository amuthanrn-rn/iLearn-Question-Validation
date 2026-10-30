import { useEffect, useState } from "react";
import axios from "axios";
import QuestionContentRenderer from "../components/QuestionContentRenderer";

function renderOptionsPreview(text = "") {
  if (!text) return <div className="text-sm text-gray-500">Not available</div>;
  const options = text.split(/\n+/).filter(Boolean);
  return (
    <div className="space-y-1">
      {options.slice(0, 4).map((opt, idx) => (
        <div key={idx} className="flex gap-2 items-start text-sm">
          <span className="font-medium whitespace-nowrap">{String.fromCharCode(65 + idx)}.</span>
          <div className="flex-1">
            <QuestionContentRenderer content={opt.replace(/^[A-D]\s*[:.)-]\s*/i, "")} className="text-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

function renderFullOptions(text = "") {
  if (!text) return <div className="text-sm text-gray-500">Not available</div>;
  const options = text.split(/\n+/).filter(Boolean);
  return (
    <div className="space-y-3">
      {options.map((opt, idx) => {
        const labelMatch = opt.match(/^[A-D]\s*[:.)-]/i);
        const label = labelMatch ? labelMatch[0].replace(/[:.)-]\s*$/, ".") : String.fromCharCode(65 + idx) + ".";
        const content = opt.replace(/^[A-D]\s*[:.)-]\s*/i, "");
        return (
          <div key={idx} className="p-3 border border-gray-200 rounded">
            <div className="font-medium mb-1">{label}</div>
            <QuestionContentRenderer content={content} />
          </div>
        );
      })}
    </div>
  );
}

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [fetching, setFetching] = useState(false);

  const [filters, setFilters] = useState({
    exam: "All",
    subject: "All",
    class: "All",
    chapter: "All",
    questionType: "All",
    review_status: "All",
    publication_status: "All",
    search: ""
  });

  const [filterOptions, setFilterOptions] = useState({
    exams: ["All"],
    subjects: ["All"],
    classes: ["All", "1 PU (Class XI)", "2 PU (Class XII)"],
    chapters: ["All"],
    questionTypes: ["All"],
    reviewStatuses: ["All"],
    publicationStatuses: ["All"]
  });

  useEffect(() => {
    axios.get("http://localhost:5002/api/questions/meta/filters")
      .then(res => {
        setFilterOptions({
          exams: ["All", ...(res.data.exams || [])],
          subjects: ["All", ...(res.data.subjects || [])],
          classes: ["All", ...(res.data.classes || [])],
          chapters: ["All", ...(res.data.chapters || [])],
          questionTypes: ["All", ...(res.data.questionTypes || [])],
          reviewStatuses: ["All", ...(res.data.reviewStatuses || [])],
          publicationStatuses: ["All", ...(res.data.publicationStatuses || [])]
        });
      })
      .catch(() => {});
  }, []);

  const fetchQuestions = async () => {
    if (fetching) return;
    const params = { page, limit };
    if (filters.exam && filters.exam !== "All") params.exam = filters.exam;
    if (filters.subject && filters.subject !== "All") params.subject = filters.subject;
    if (filters.class && filters.class !== "All") params.class = filters.class;
    if (filters.chapter && filters.chapter !== "All") params.chapter = filters.chapter;
    if (filters.questionType && filters.questionType !== "All") params.questionType = filters.questionType;
    if (filters.review_status && filters.review_status !== "All") params.review_status = filters.review_status;
    if (filters.publication_status && filters.publication_status !== "All") params.publication_status = filters.publication_status;
    if (filters.search && filters.search.trim()) params.search = filters.search.trim();

    setFetching(true);
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5002/api/questions", { params });
      setQuestions(res.data.questions || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 0);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setQuestions([]);
      setTotal(0);
    } finally {
      setLoading(false);
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [page, limit, filters]);

  useEffect(() => {
    const params = {};
    if (filters.subject && filters.subject !== "All") params.subject = filters.subject;
    if (filters.class && filters.class !== "All") params.class = filters.class;
    axios.get("http://localhost:5002/api/questions/meta/chapters", { params })
      .then(res => {
        setFilterOptions(prev => ({
          ...prev,
          chapters: ["All", ...(res.data.chapters || [])]
        }));
        if (filters.chapter !== "All" && !(res.data.chapters || []).includes(filters.chapter)) {
          setFilters(f => ({ ...f, chapter: "All" }));
        }
      })
      .catch(() => {});
  }, [filters.subject, filters.class]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ exam: "All", subject: "All", class: "All", chapter: "All", questionType: "All", review_status: "All", publication_status: "All", search: "" });
    setPage(1);
  };

  const goToPage = (p) => {
    if (fetching) return;
    if (p >= 1 && p <= totalPages) {
      setPage(p);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    const start = Math.max(1, page - 3);
    const end = Math.min(totalPages, page + 3);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const openModal = (q) => {
    setSelectedQuestion(q);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedQuestion(null);
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="space-y-6 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Questions</h1>
            <p className="text-gray-600 mt-1">Browse question bank from PostgreSQL</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam</label>
                <select value={filters.exam} onChange={(e) => handleFilterChange("exam", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  {filterOptions.exams.map((opt, idx) => <option key={idx} value={opt}>{opt === "All" ? "All Exams" : opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select value={filters.subject} onChange={(e) => handleFilterChange("subject", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  {filterOptions.subjects.map((opt, idx) => <option key={idx} value={opt}>{opt === "All" ? "All Subjects" : opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select value={filters.class} onChange={(e) => handleFilterChange("class", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  {filterOptions.classes.map((opt, idx) => <option key={idx} value={opt}>{opt === "All" ? "All Classes" : opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chapter</label>
                <select value={filters.chapter} onChange={(e) => handleFilterChange("chapter", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  {filterOptions.chapters.map((opt, idx) => <option key={idx} value={opt}>{opt === "All" ? "All Chapters" : opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                <select value={filters.questionType} onChange={(e) => handleFilterChange("questionType", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  {filterOptions.questionTypes.map((opt, idx) => <option key={idx} value={opt}>{opt === "All" ? "All Types" : opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review Status</label>
                <select value={filters.review_status} onChange={(e) => handleFilterChange("review_status", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  {filterOptions.reviewStatuses.map((opt, idx) => <option key={idx} value={opt}>{opt === "All" ? "All" : opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Published Status</label>
                <select value={filters.publication_status} onChange={(e) => handleFilterChange("publication_status", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  {filterOptions.publicationStatuses.map((opt, idx) => <option key={idx} value={opt}>{opt === "All" ? "All" : opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input type="text" value={filters.search} onChange={(e) => handleFilterChange("search", e.target.value)} placeholder="Search by QID or question text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
            <button onClick={clearFilters} className="px-4 py-2 bg-gray-600 text-white rounded-lg">Clear Filters</button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">Showing {startItem}-{endItem} of {total} questions</div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Rows Per Page:</span>
                <select value={limit} onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }} className="px-2 py-1 border border-gray-300 rounded-lg text-sm">
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                {loading && <div className="text-sm text-gray-500">Loading...</div>}
              </div>
            </div>
            {error && <div className="px-6 py-4 text-sm text-red-600">Error: {error}</div>}
            {!loading && !error && questions.length === 0 && <div className="px-6 py-8 text-center text-gray-500">No questions found</div>}
            {!loading && questions.length > 0 && (
              <div className="w-full overflow-x-auto">
                <table className="min-w-full w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">QID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Options</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Key / Correct Answer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Subject</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {questions.map((q) => (
                      <tr key={q.qid} className="hover:bg-gray-50 align-top">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{q.qid}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 max-w-md"><QuestionContentRenderer content={q.question} /></td>
                        <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">{renderOptionsPreview(q.options)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 max-w-xs"><QuestionContentRenderer content={q.answer_key} /></td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{q.subject || "Not available"}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <button onClick={() => openModal(q)} className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 bg-white border-t px-6 py-3 flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm text-gray-700">Page {page} of {totalPages}</div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => goToPage(1)} disabled={page === 1 || fetching} className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50">First</button>
          <button onClick={() => goToPage(page - 1)} disabled={page === 1 || fetching} className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50">Previous</button>
          {getPageNumbers().map(p => (
            <button key={p} onClick={() => goToPage(p)} disabled={fetching} className={"px-3 py-1 border rounded-lg text-sm " + (p === page ? "bg-blue-600 text-white border-blue-600" : "border-gray-300")}>{p}</button>
          ))}
          <button onClick={() => goToPage(page + 1)} disabled={page === totalPages || fetching} className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50">Next</button>
          <button onClick={() => goToPage(totalPages)} disabled={page === totalPages || fetching} className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50">Last</button>
        </div>
      </div>

      {modalOpen && selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">Question Details - QID {selectedQuestion.qid}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="px-6 py-4 space-y-6 text-sm">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div><span className="font-medium">QID:</span> {selectedQuestion.qid}</div>
                <div><span className="font-medium">Subject:</span> {selectedQuestion.subject || "Not available"}</div>
                <div><span className="font-medium">Exam:</span> {selectedQuestion.exam || "Not available"}</div>
                <div><span className="font-medium">Chapter:</span> {selectedQuestion.chapter || "Not available"}</div>
                <div><span className="font-medium">Question Type:</span> {selectedQuestion.category || "Not available"}</div>
                <div><span className="font-medium">Published Status:</span> {selectedQuestion.current_publication_status || selectedQuestion.publication_status_at_screening || "Not available"}</div>
                <div><span className="font-medium">Review Status:</span> {selectedQuestion.review_status || "Not available"}</div>
              </div>
              <div>
                <div className="font-medium mb-2">Question</div>
                <QuestionContentRenderer content={selectedQuestion.question} />
              </div>
              <div>
                <div className="font-medium mb-2">Options</div>
                {renderFullOptions(selectedQuestion.options)}
              </div>
              <div>
                <div className="font-medium mb-2">Key / Correct Answer</div>
                <div className="p-3 bg-green-50 border border-green-200 rounded"><QuestionContentRenderer content={selectedQuestion.answer_key} /></div>
              </div>
              <div>
                <div className="font-medium mb-2">Explanation</div>
                <QuestionContentRenderer content={selectedQuestion.stored_explanation} />
              </div>
              <div>
                <div className="font-medium mb-2">Additional Information</div>
                <div className="space-y-2">
                  <div><span className="font-medium">Solution Key / Review Result:</span> <div className="mt-1"><QuestionContentRenderer content={selectedQuestion.solution_key_review_result} /></div></div>
                  <div><span className="font-medium">Screening Batch:</span> {selectedQuestion.screening_batch_existing_question_ordinal || "Not available"}</div>
                  <div><span className="font-medium">Flag Status:</span> {selectedQuestion.flag_status || "Not available"}</div>
                  <div><span className="font-medium">Question URL:</span> {selectedQuestion.question_url ? <a href={selectedQuestion.question_url} target="_blank" rel="noreferrer" className="text-blue-600">{selectedQuestion.question_url}</a> : "Not available"}</div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button onClick={closeModal} className="px-4 py-2 bg-gray-600 text-white rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questions;
