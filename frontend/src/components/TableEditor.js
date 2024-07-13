import React, { useState } from 'react';
import Modal from 'react-modal';

const TableEditor = ({ data, type, onRowClick, onVideoCallClick }) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    const openModal = (image) => {
        setSelectedImage(image);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedImage('');
    };

    const renderTableHeader = () => {
        if (data.length === 0) return null;
        const headers = Object.keys(data[0]);
        return headers.map((key, index) => <th key={index}>{key.toUpperCase()}</th>);
    };

    const renderTableData = () => {
        return data.map((item, index) => (
            <tr key={index} onClick={() => type === 'users' && onRowClick(item._id)}>
                {Object.entries(item).map(([key, value], idx) => (
                    <td key={idx}>
                        {key === 'image' ? (
                            <button onClick={(e) => { e.stopPropagation(); openModal(value); }}>Detection</button>
                        ) : (
                            typeof value === 'object' ? JSON.stringify(value) : value
                        )}
                    </td>
                ))}
                {type === 'users' && (
                    <td>
                        <button onClick={(e) => { e.stopPropagation(); onVideoCallClick(item._id); }}>
                            {item.isCalling ? 'End Call' : 'Video Call'}
                        </button>
                    </td>
                )}
            </tr>
        ));
    };

    return (
        <div>
            <table>
                <thead>
                    <tr>{renderTableHeader()}</tr>
                </thead>
                <tbody>
                    {renderTableData()}
                </tbody>
            </table>

            <Modal isOpen={modalIsOpen} onRequestClose={closeModal} contentLabel="Image Modal">
                <h2>Detection Image</h2>
                <button onClick={closeModal}>Close</button>
                {selectedImage && <img src={`data:image/jpeg;base64,${selectedImage}`} alt="Detection" style={{ width: '80%', height: '80%' }} />}
            </Modal>
        </div>
    );
};

export default TableEditor;
