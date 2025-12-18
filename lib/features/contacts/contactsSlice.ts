import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchContacts, addContact, addContactList, updateContact, deleteContact } from './contactsThunk';

export interface Contact {
    id: string;
    name: string;
    description: string;
    lastInteraction: string;
    profileLink: string;
    phoneNumber: string;
    priority: "L1" | "L2" | "L3";
    frequencyDays: number;
    lastContactedDays: number;
    userId?: string;
    pingTemplate?: string;
}

interface ContactsState {
    contacts: Contact[];
    loading: boolean;
    error: string | null;
}

const initialState: ContactsState = {
    contacts: [],
    loading: false,
    error: null,
};

const contactsSlice = createSlice({
    name: 'contacts',
    initialState,
    reducers: {
        // Optional: clear contacts or other sync actions
        clearContacts: (state) => {
            state.contacts = [];
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Contacts
            .addCase(fetchContacts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchContacts.fulfilled, (state, action: PayloadAction<Contact[]>) => {
                state.loading = false;
                state.contacts = action.payload;
            })
            .addCase(fetchContacts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Add Contact (we mostly rely on refetch, but can handle state if needed)
            .addCase(addContact.rejected, (state, action) => {
                // Could set error here if we want to display it in UI independently of the return value
            })
            // Add Contact List
            .addCase(addContactList.rejected, (state, action) => {
            })
            // Update Contact
            .addCase(updateContact.rejected, (state, action) => {
            })
            // Delete Contact
            .addCase(deleteContact.rejected, (state, action) => {
            });
    },
});

export const { clearContacts } = contactsSlice.actions;
export default contactsSlice.reducer;
