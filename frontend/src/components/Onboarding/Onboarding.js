import { useState } from "react";
import { Zap, User, Mail, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";


export default function Onboarding() {
  
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: "Demo User",
    email: "demo@example.com",
    orgName: "XTS",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName) newErrors.fullName = "Full name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.orgName) newErrors.orgName = "Company name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      navigate("/Enrichment");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#f8fafc" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
            <Zap size={18} className="text-black" />
          </div>
          <div>
            <div className="font-bold text-xl text-gray-800">
              DELPHI AI
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Set up your account
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Tell us about yourself and your organization to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <div className="relative mt-1">
                <User
                  size={15}
                  className="absolute left-1 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="pl-9 h-10 w-full border rounded-md px-4"
                  placeholder="Vedant Mulherkar"
                />
              </div>
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium">Work Email</label>
              <div className="relative mt-1">
                <Mail
                  size={15}
                  className="absolute left-1 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-9 h-10 w-full border rounded-md px-4"
                  placeholder="vedant @company.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Company Name */}
            <div>
              <label className="text-sm font-medium">Company Name</label>
              <div className="relative mt-1">
                <Building2
                  size={15}
                  className="absolute left-1 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  name="orgName"
                  value={formData.orgName}
                  onChange={handleChange}
                  className="pl-9 h-10 w-full border rounded-md px-4"
                  placeholder="XTS"
                />
              </div>
              {errors.orgName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.orgName}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md mt-2"
            >
              Create Account & Continue
            </button>
          </form>
        </div>

        
      </div>
    </div>
  );
}