import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './draft.css';

const Drafts = () => {
    const [drafts, setDrafts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDrafts = async () => {
            try {
                const res = await axiosInstance.get('/drafts');
                setDrafts(res.data);
            } catch (err) {
                console.error('Error fetching drafts:', err);
            }
        };

        fetchDrafts();
    }, []);

    const handleEdit = (id) => {
        navigate(`/edit-draft/${id}`);
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosInstance.delete(`/drafts/${id}`);
                    setDrafts(drafts.filter(draft => draft.id !== id));
                    Swal.fire(
                        'Deleted!',
                        'Your draft has been deleted.',
                        'success'
                    );
                } catch (err) {
                    console.error('Error deleting draft:', err);
                    Swal.fire(
                        'Error!',
                        'There was an error deleting your draft.',
                        'error'
                    );
                }
            }
        });
    };

    return (
        <div className="drafts-table">
            <h1 className='draft-heading'>Winners Gallery Draft</h1>
            <table>
                <thead>
                    <tr>
                        <th className='heading-table'>Title</th>
                        <th className='heading-table'>Image</th>
                        <th className='heading-table'>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {drafts.map(draft => (
                        <tr className='table-data' key={draft.id}>
                            <td className='table-data'>{draft.title}</td>
                            <td className='table-data'>
                                <img src={draft.img} alt="Preview" style={{ height: "100px", width: "200px" }} />
                            </td>
                            <td className='table-data'>
                                <button className='read-more2' onClick={() => handleEdit(draft.id)}>Edit</button>
                                <button className='read-more2' onClick={() => handleDelete(draft.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Drafts;
