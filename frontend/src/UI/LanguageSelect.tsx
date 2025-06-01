import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getPreferredLanguage, updatePreferredLanguage } from '../services/userService';
import i18n from '../i18n';

interface LanguageSelectPopupProps {
  onClose: () => void;
}

export const LanguageSelectPopup: React.FC<LanguageSelectPopupProps> = ({ onClose }) => {
  const { t } = useTranslation('settings');
  const [selectedLang, setSelectedLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'fi', label: 'Finnish' },
    { code: 'pt', label: 'Portuguese' },
  ];

  // Load current preferred language when popup opens
  useEffect(() => {
    (async () => {
      try {
        const response = await getPreferredLanguage();
        if (response.language && languages.some(lang => lang.code === response.language)) {
          setSelectedLang(response.language);
        }
      } catch {
        // Optionally handle fetch error
      }
    })();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      await updatePreferredLanguage(selectedLang);
      i18n.changeLanguage(selectedLang);
      localStorage.setItem('preferredLanguage', selectedLang);
      alert(t('language_saved_success'));
      onClose();
    } catch (e) {
      setError(t('language_save_error'));
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[400px] max-w-[90%] p-6 mx-auto">
        <h2 className="text-2xl font-bold mb-4">{t('select_language')}</h2>
        <div className="flex flex-col gap-3 mb-6">
          {languages.map(({ code, label }) => (
            <label key={code} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="language"
                value={code}
                checked={selectedLang === code}
                onChange={() => setSelectedLang(code)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded bg-gray-200 hover:bg-gray-300"
            disabled={loading}
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
            disabled={loading}
          >
            {loading ? t('saving') : t('save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelectPopup;
