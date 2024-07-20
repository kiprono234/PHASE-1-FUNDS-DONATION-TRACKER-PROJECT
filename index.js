document.addEventListener('DOMContentLoaded', () => {
    const addDonationBtn = document.querySelector('.add-donation');
    const donationsTableBody = document.getElementById('donationsTable');
    const searchBtn = document.getElementById('searchBtn');
    const resetBtn = document.getElementById('resetBtn');
    const searchInput = document.getElementById('searchInput');
    const donationForm = document.getElementById('donationForm');
    const formTitle = document.getElementById('formTitle');
    const cancelBtn = document.querySelector('.cancel-btn');
    const amountInput = document.getElementById('amount');
    const currencyInput = document.getElementById('currency');
    let editMode = false;
    let editDonationId = null;

    addDonationBtn.addEventListener('click', () => {
        formTitle.textContent = 'Add Donation';
        donationForm.reset();
        donationForm.classList.remove('hidden');
        editMode = false;

        // Scroll to the donation form
        donationForm.scrollIntoView({ behavior: 'smooth' });
    });

    cancelBtn.addEventListener('click', () => {
        donationForm.reset();
        donationForm.classList.add('hidden');
    });

    donationForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(donationForm);
        const newDonation = {
            date: formData.get('donationDate'),
            name: formData.get('donorName'),
            email: formData.get('donorEmail'),
            fundraisers: formData.get('fundraisers'),
            amount: formData.get('amount'),
            currency: formData.get('currency'),
            donationType: formData.get('donationType')
        };

        if (editMode) {
            updateDonation(editDonationId, newDonation);
        } else {
            postDonation(newDonation);
        }

        donationForm.reset();
        donationForm.classList.add('hidden');
    });

    searchBtn.addEventListener('click', () => {
        const searchQuery = searchInput.value.trim().toLowerCase();
        if (searchQuery) {
            fetchDonations(searchQuery);
        }
    });

    resetBtn.addEventListener('click', () => {
        searchInput.value = '';
        fetchDonations();
    });

    function postDonation(newDonation) {
        fetch('http://localhost:3000/donations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newDonation)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Donation added:', data);
            displayDonation(data);
        })
        .catch(error => console.error('Error adding donation:', error));
    }

    function displayDonation(donation) {
        const row = document.createElement('tr');
        row.setAttribute('data-id', donation.id);
        row.innerHTML = `
            <td>${donation.date}</td>
            <td>${donation.name}</td>
            <td>${donation.email}</td>
            <td>${donation.fundraisers}</td>
            <td>${formatCurrency(donation.amount, donation.currency)}</td>
            <td>${donation.donationType}</td>
            <td>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </td>
        `;
        donationsTableBody.appendChild(row);

        const editBtn = row.querySelector('.edit-btn');
        const deleteBtn = row.querySelector('.delete-btn');

        editBtn.addEventListener('click', () => {
            editDonation(donation);
        });
        deleteBtn.addEventListener('click', () => {
            deleteDonation(donation.id, row);
        });
    }

    function formatCurrency(amount, currency) {
        let formattedAmount;
        if (currency === 'USD') {
            formattedAmount = `$${parseFloat(amount).toFixed(2)}`;
        } else if (currency === 'KSH') {
            formattedAmount = `KSH ${parseFloat(amount).toFixed(2)}`;
        }
        return formattedAmount;
    }

    function editDonation(donation) {
        formTitle.textContent = 'Edit Donation';
        donationForm.donationDate.value = donation.date;
        donationForm.donorName.value = donation.name;
        donationForm.donorEmail.value = donation.email;
        donationForm.fundraisers.value = donation.fundraisers;
        donationForm.amount.value = donation.amount;
        donationForm.currency.value = donation.currency;
        donationForm.donationType.value = donation.donationType;
        donationForm.classList.remove('hidden');
        editMode = true;
        editDonationId = donation.id;
        donationForm.scrollIntoView({ behavior: 'smooth' });
    }

    function updateDonation(id, updatedDonation) {
        fetch(`http://localhost:3000/donations/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedDonation)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Donation updated:', data);
            updateTableRow(data);
        })
        .catch(error => console.error('Error updating donation:', error));
    }

    function updateTableRow(donation) {
        const row = donationsTableBody.querySelector(`tr[data-id='${donation.id}']`);
        row.innerHTML = `
            <td>${donation.date}</td>
            <td>${donation.name}</td>
            <td>${donation.email}</td>
            <td>${donation.fundraisers}</td>
            <td>${formatCurrency(donation.amount, donation.currency)}</td>
            <td>${donation.donationType}</td>
            <td>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </td>
        `;

        const editBtn = row.querySelector('.edit-btn');
        const deleteBtn = row.querySelector('.delete-btn');

        editBtn.addEventListener('click', () => {
            editDonation(donation);
        });
        deleteBtn.addEventListener('click', () => {
            deleteDonation(donation.id, row);
        });
    }

    function deleteDonation(id, row) {
        if (confirm('Are you sure you want to delete this donation?')) {
            fetch(`http://localhost:3000/donations/${id}`, {
                method: 'DELETE'
            })
            .then(() => {
                console.log('Donation deleted');
                row.remove();
            })
            .catch(error => console.error('Error deleting donation:', error));
        }
    }

    function fetchDonations(searchQuery = '') {
        fetch('http://localhost:3000/donations')
            .then(response => response.json())
            .then(donations => {
                donationsTableBody.innerHTML = '';
                const filteredDonations = donations.filter(donation => 
                    donation.donationType.toLowerCase().includes(searchQuery) ||
                    donation.name.toLowerCase().includes(searchQuery)
                );
                filteredDonations.forEach(donation => displayDonation(donation));
            })
            .catch(error => console.error('Error fetching donations:', error));
    }

    fetchDonations();
});

