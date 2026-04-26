// src/hooks/useIssueForm.js
import { useState } from "react";
import { issueAPI } from "../services/api";

const INITIAL = {
  title:          "",
  description:    "",
  category:       "Garbage",
  locationText:   "",
  locationCoords: null,
  media:          [],
};

export function useIssueForm(onSuccess) {
  const [formData,   setFormData]   = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState(false);

  const setField = (name, value) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  const handleChange = (e) => setField(e.target.name, e.target.value);

  const handleCategory = (cat) => setField("category", cat);

  const handleLocationSelect = (coords) => setField("locationCoords", coords);

  const handleMediaUpload = (e) => {
    Array.from(e.target.files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        setFormData((prev) => ({ ...prev, media: [...prev.media, reader.result] }));
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);
    try {
      const { issue } = await issueAPI.create(formData);
      onSuccess?.(issue);
      setSuccess(true);
      setFormData(INITIAL);
    } catch (err) {
      setError(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    formData, submitting, error, success,
    handleChange, handleCategory, handleLocationSelect,
    handleMediaUpload, handleSubmit,
  };
}
