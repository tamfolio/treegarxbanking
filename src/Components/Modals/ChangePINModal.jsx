import React, { useState } from "react";
import { XMarkIcon, KeyIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { useChangePIN } from "../../hooks/useProfile";

const ChangePINModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    oldPin: "",
    newPin: "",
    confirmPin: ""
  });
  const [showPins, setShowPins] = useState({
    oldPin: false,
    newPin: false,
    confirmPin: false
  });
  const [errors, setErrors] = useState({});

  const changePinMutation = useChangePIN();

  const toggleShowPin = (field) => {
    setShowPins(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Only allow numeric input and limit to 4 digits
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      // Clear error for this field when user starts typing
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ""
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.oldPin) {
      newErrors.oldPin = "Current PIN is required";
    } else if (formData.oldPin.length !== 4) {
      newErrors.oldPin = "Current PIN must be 4 digits";
    }

    if (!formData.newPin) {
      newErrors.newPin = "New PIN is required";
    } else if (formData.newPin.length !== 4) {
      newErrors.newPin = "New PIN must be 4 digits";
    } else if (formData.newPin === formData.oldPin) {
      newErrors.newPin = "New PIN must be different from current PIN";
    }

    if (!formData.confirmPin) {
      newErrors.confirmPin = "Please confirm your new PIN";
    } else if (formData.confirmPin !== formData.newPin) {
      newErrors.confirmPin = "PINs do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await changePinMutation.mutateAsync({
        oldPin: formData.oldPin,
        newPin: formData.newPin,
        confirmPin: formData.confirmPin
      });

      if (result.success) {
        toast.success("PIN changed successfully!");
        handleClose();
      } else {
        toast.error(result.message || "Failed to change PIN");
        setErrors({ submit: result.message || "Failed to change PIN" });
      }
    } catch (error) {
      console.error("PIN change error:", error);
      toast.error(error.message || "Failed to change PIN");
      setErrors({ submit: error.message || "Failed to change PIN" });
    }
  };

  const handleClose = () => {
    setFormData({
      oldPin: "",
      newPin: "",
      confirmPin: ""
    });
    setShowPins({
      oldPin: false,
      newPin: false,
      confirmPin: false
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <KeyIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Change PIN</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Current PIN */}
            <div>
              <label htmlFor="oldPin" className="block text-sm font-medium text-gray-700 mb-2">
                Current PIN
              </label>
              <div className="relative">
                <input
                  type={showPins.oldPin ? "text" : "password"}
                  id="oldPin"
                  name="oldPin"
                  value={formData.oldPin}
                  onChange={handleInputChange}
                  placeholder="Enter current PIN"
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-center text-lg tracking-widest ${
                    errors.oldPin ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                  maxLength="4"
                />
                <button
                  type="button"
                  onClick={() => toggleShowPin("oldPin")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPins.oldPin ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.oldPin && (
                <p className="mt-1 text-sm text-red-600">{errors.oldPin}</p>
              )}
            </div>

            {/* New PIN */}
            <div>
              <label htmlFor="newPin" className="block text-sm font-medium text-gray-700 mb-2">
                New PIN
              </label>
              <div className="relative">
                <input
                  type={showPins.newPin ? "text" : "password"}
                  id="newPin"
                  name="newPin"
                  value={formData.newPin}
                  onChange={handleInputChange}
                  placeholder="Enter new PIN"
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-center text-lg tracking-widest ${
                    errors.newPin ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                  maxLength="4"
                />
                <button
                  type="button"
                  onClick={() => toggleShowPin("newPin")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPins.newPin ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.newPin && (
                <p className="mt-1 text-sm text-red-600">{errors.newPin}</p>
              )}
            </div>

            {/* Confirm PIN */}
            <div>
              <label htmlFor="confirmPin" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New PIN
              </label>
              <div className="relative">
                <input
                  type={showPins.confirmPin ? "text" : "password"}
                  id="confirmPin"
                  name="confirmPin"
                  value={formData.confirmPin}
                  onChange={handleInputChange}
                  placeholder="Confirm new PIN"
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-center text-lg tracking-widest ${
                    errors.confirmPin ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                  maxLength="4"
                />
                <button
                  type="button"
                  onClick={() => toggleShowPin("confirmPin")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPins.confirmPin ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPin && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPin}</p>
              )}
            </div>
          </div>

          {/* PIN Requirements */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">PIN Requirements:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Must be exactly 4 digits</li>
              <li>• Cannot be the same as your current PIN</li>
              <li>• Choose a PIN that's easy to remember but hard to guess</li>
            </ul>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={changePinMutation.isPending}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={changePinMutation.isPending}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              {changePinMutation.isPending ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Changing...</span>
                </div>
              ) : (
                "Change PIN"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePINModal;