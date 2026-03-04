import {useState} from "react";
import { useNavigate } from "react-router-dom";
//import { useNavigate, useLocation } from "react-router-dom";
import{Zap,Search, Loader2, Save, ArrowRight, Tag, X}from "lucide-react";

export default function Enrichment() {
  const [domainInput, setDomainInput] = useState("");
  const [isEnriching, setIsEnriching] = useState(false);
  const [enriched, setEnriched] = useState(false);
  const [techInput, setTechInput] = useState("");

  const [form, setForm] = useState({
    domain: "",
    companyName: "",
    companySize: "",
    industry: "",
    revenueBand: "",
    hqLocation: "",
    techStack: [],
    description: "",
  });
  const navigate = useNavigate();


  // Fake enrichment simulation
  const handleEnrich = async () => {
    if (!domainInput.trim()) return;

    setIsEnriching(true);
    setEnriched(false);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setForm({
      domain: domainInput,
      companyName: "Acme Corporation",
      companySize: "250",
      industry: "Software",
      revenueBand: "$10M - $50M",
      hqLocation: "San Francisco, CA",
      techStack: ["React", "Node.js", "AWS"],
      description:
        "Acme Corporation is a fast-growing SaaS company focused on AI-powered analytics.",
    });

    setIsEnriching(false);
    setEnriched(true);
  };

  const addTech = () => {
    const t = techInput.trim();
    if (t && !form.techStack.includes(t)) {
      setForm({ ...form, techStack: [...form.techStack, t] });
    }
    setTechInput("");
  };

  const removeTech = (tech) => {
    setForm({
      ...form,
      techStack: form.techStack.filter((t) => t !== tech),
    });
  };

  const handleSave = () => {
     navigate("/");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#f8fafc" }}
    >
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
            <Zap size={20} className="text-black" />
          </div>
          <div className="font-bold text-xl text-gray-800">
            DELPHI AI
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Enrich your company profile
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Enter your company domain to auto-populate your profile.
            </p>
          </div>

          {/* Domain Input */}
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-1 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                placeholder="e.g. xtsworld.in or linkedin.com/company/xts-world"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                className="pl-9 h-11 w-full border rounded-md px-4"
              />
            </div>
            <button
              onClick={handleEnrich}
              disabled={!domainInput.trim() || isEnriching}
              className="h-11 px-5 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
            >
              {isEnriching ? "Enriching..." : "Enrich"}
            </button>
          </div>

          {/* Loading */}
          {isEnriching && (
            <div className="text-center text-gray-500">
              <Loader2 className="animate-spin mx-auto mb-2" />
              Analyzing company data...
            </div>
          )}

          {/* Enriched Form */}
          {enriched && !isEnriching && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  className="border rounded-md p-2"
                  value={form.companyName}
                  placeholder="Company Name"
                  onChange={(e) =>
                    setForm({ ...form, companyName: e.target.value })
                  }
                />
                <input
                  className="border rounded-md p-2"
                  value={form.industry}
                  placeholder="Industry"
                  onChange={(e) =>
                    setForm({ ...form, industry: e.target.value })
                  }
                />
                <input
                  className="border rounded-md p-2"
                  value={form.companySize}
                  placeholder="Company Size"
                  onChange={(e) =>
                    setForm({ ...form, companySize: e.target.value })
                  }
                />
                <input
                  className="border rounded-md p-2"
                  value={form.revenueBand}
                  placeholder="Revenue Size"
                  onChange={(e) =>
                    setForm({ ...form, revenueBand: e.target.value })
                  }
                />
              </div>

              {/* Tech Stack */}
              <div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs"
                    >
                      <Tag size={10} />
                      {tech}
                      <button onClick={() => removeTech(tech)}>
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    placeholder="Add technology..."
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    className="border rounded-md p-2 flex-1"
                  />
                  <button
                    onClick={addTech}
                    className="bg-gray-200 px-3 rounded-md"
                  >
                    Add
                  </button>
                </div>
              </div>

              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="border rounded-md p-2 w-full"
                rows={3}
              />

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="flex-1 h-11 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                >
                  <Save size={15} className="inline mr-2" />
                  Save Profile
                </button>

                {/* <button
                  className="text-gray-500 flex items-center gap-1"
                >
                  Skip for now <ArrowRight size={14} />
                </button> */}
              </div>
            </div>
          )}

          {/* Initial State */}
          {!enriched && !isEnriching && (
            <div className="text-center py-6 text-gray-400">
              Enter a domain above to enrich your company profile
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
