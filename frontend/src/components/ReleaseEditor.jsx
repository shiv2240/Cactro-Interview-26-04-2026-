import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRelease, updateRelease, createRelease, deleteRelease } from '../api';
import { Trash2, Check } from 'lucide-react';

const ReleaseEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [release, setRelease] = useState({
    name: '',
    release_date: '',
    additional_info: '',
    steps: []
  });
  const [loading, setLoading] = useState(isEditing);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing) {
      fetchRelease();
    } else {
      // populate with mock empty steps if creating new just for visual matching
      // The backend creates them anyway, but for the UI mockup to look right on creation:
      setRelease(prev => ({
        ...prev,
        steps: [
          { id: 1, name: "All relevant GitHub pull requests have been merged", completed: false },
          { id: 2, name: "CHANGELOG.md files have been updated", completed: false },
          { id: 3, name: "All tests are passing", completed: false },
          { id: 4, name: "Releases in GitHub created", completed: false },
          { id: 5, name: "Deployed in demo", completed: false },
          { id: 6, name: "Tested thoroughly in demo", completed: false },
          { id: 7, name: "Deployed in production", completed: false }
        ]
      }));
    }
  }, [id]);

  const fetchRelease = async () => {
    try {
      const { data } = await getRelease(id);
      
      // format date for text input like mockup (September 20, 2022) 
      // The mockup actually shows "Date" as a text box with input. Using text or date type. 
      // To keep standard HTML5 date, let's format for YYYY-MM-DD
      let dateString = '';
      if (data.release_date) {
          const ts = !isNaN(data.release_date) ? Number(data.release_date) : data.release_date;
          const dateObj = new Date(ts);
          if (!isNaN(dateObj)) {
              const yyyy = dateObj.getFullYear();
              const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
              const dd = String(dateObj.getDate()).padStart(2, '0');
              dateString = `${yyyy}-${mm}-${dd}`;
          }
      }

      setRelease({
        ...data,
        release_date: dateString
      });
    } catch (error) {
      console.error('Failed to fetch release', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRelease(prev => ({ ...prev, [name]: value }));
    
    // Clear error gracefully when user starts typing correctly
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleToggleStep = (stepId) => {
    setRelease(prev => {
      const newSteps = prev.steps.map(step => 
        step.id === stepId ? { ...step, completed: !step.completed } : step
      );
      return { ...prev, steps: newSteps };
    });
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!release.name || !release.name.trim()) {
      newErrors.name = 'Please provide a valid release name.';
    }
    if (!release.release_date) {
      newErrors.release_date = 'Please select an intended release date.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await updateRelease(id, release);
        navigate('/');
      } else {
        await createRelease(release);
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to save release', error);
      alert(error.message || 'Failed to save release.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this release?')) {
      try {
        await deleteRelease(id);
        navigate('/');
      } catch (error) {
        console.error('Failed to delete release', error);
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="main-box">
      <div className="box-header">
        <div className="breadcrumb">
          <Link to="/" className="breadcrumb-link">All releases</Link>
          <span style={{margin: '0 0.5rem', color: 'var(--text-muted)'}}>&gt;</span>
          <span className="breadcrumb-current">{isEditing ? release.name || 'Version' : 'New Release'}</span>
        </div>
        {isEditing && (
          <button onClick={handleDelete} className="btn btn-danger">
            Delete <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="form-content">
        <div className="form-row">
          <div className="form-group">
            <label>Release <span style={{color: 'var(--danger, #e53e3e)'}}>*</span></label>
            <input 
              type="text" 
              name="name" 
              className="form-control" 
              style={errors.name ? { borderColor: 'var(--danger, #e53e3e)' } : {}}
              value={release.name} 
              onChange={handleChange}
              placeholder="Version 1.0.1"
            />
            {errors.name && <span style={{color: 'var(--danger, #e53e3e)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block'}}>{errors.name}</span>}
          </div>
          <div className="form-group">
            <label>Date <span style={{color: 'var(--danger, #e53e3e)'}}>*</span></label>
            <input 
              type="date" 
              name="release_date" 
              className="form-control" 
              style={errors.release_date ? { borderColor: 'var(--danger, #e53e3e)' } : {}}
              value={release.release_date} 
              onChange={handleChange}
            />
            {errors.release_date && <span style={{color: 'var(--danger, #e53e3e)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block'}}>{errors.release_date}</span>}
          </div>
        </div>

        <ul className="checklist">
          {release.steps.map(step => (
            <li key={step.id} className="checklist-item">
              <input 
                type="checkbox" 
                checked={step.completed} 
                onChange={() => handleToggleStep(step.id)} 
              />
              <span>{step.name}</span>
            </li>
          ))}
        </ul>

        <div className="form-group" style={{marginTop: '2rem'}}>
          <label>Additional remarks / tasks</label>
          <textarea 
            name="additional_info" 
            className="form-control" 
            rows="5"
            placeholder="Please enter any other important notes for the release"
            value={release.additional_info}
            onChange={handleChange}
          ></textarea>
        </div>
      </div>

      <div className="box-footer">
        <button onClick={handleSave} className="btn btn-primary">
          Save <Check size={16} />
        </button>
      </div>
    </div>
  );
};

export default ReleaseEditor;
