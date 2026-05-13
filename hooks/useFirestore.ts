
import { useState, useEffect, useCallback } from 'react';

const PROJECT_ID = 'good-skin-2';
const BASE_DB_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

export const useFirestore = (collection: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const url = `${BASE_DB_URL}/${collection}`;

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      
      if (result.documents) {
        const mapped = result.documents.map((doc: any) => {
          const fields = doc.fields;
          const obj: any = { id: doc.name.split('/').pop() };
          for (const key in fields) {
            obj[key] = fields[key].stringValue || fields[key].timestampValue || fields[key].integerValue || fields[key].booleanValue || fields[key].doubleValue;
            // Handle nested JSON strings if any
            if (key === 'aiAnalysis' && typeof obj[key] === 'string') {
              try { obj[key] = JSON.parse(obj[key]); } catch (e) {}
            }
          }
          return obj;
        });
        setData(mapped);
      } else {
        setData([]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  const addDocument = async (id: string | null, fields: any) => {
    const payload = {
      fields: Object.keys(fields).reduce((acc: any, key) => {
        const val = fields[key];
        if (typeof val === 'string') acc[key] = { stringValue: val };
        else if (typeof val === 'number') acc[key] = { doubleValue: val };
        else if (typeof val === 'boolean') acc[key] = { booleanValue: val };
        else if (val instanceof Date) acc[key] = { timestampValue: val.toISOString() };
        else if (typeof val === 'object') acc[key] = { stringValue: JSON.stringify(val) };
        return acc;
      }, {})
    };

    const method = id ? 'PATCH' : 'POST';
    const finalUrl = id ? `${url}/${id}` : url;

    const response = await fetch(finalUrl, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Failed to save document');
    return await response.json();
  };

  const getDocument = async (id: string) => {
    const response = await fetch(`${url}/${id}`);
    if (!response.ok) return null;
    const doc = await response.json();
    const fields = doc.fields;
    const obj: any = { id: doc.name.split('/').pop() };
    for (const key in fields) {
      obj[key] = fields[key].stringValue || fields[key].timestampValue || fields[key].integerValue || fields[key].booleanValue || fields[key].doubleValue;
      if (key === 'aiAnalysis' && typeof obj[key] === 'string') {
        try { obj[key] = JSON.parse(obj[key]); } catch (e) {}
      }
    }
    return obj;
  };

  return { data, loading, error, fetchData, addDocument, getDocument };
};
