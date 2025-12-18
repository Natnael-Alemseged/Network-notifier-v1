import { createAsyncThunk } from '@reduxjs/toolkit';
import { Contact } from './contactsSlice';
import {ApiService} from "@/lib/util/apiService";

 type ApiContact = {
     id: string;
     userId?: string;
     name: string;
     description?: string | null;
     lastInteraction?: string | null;
     profileLink?: string | null;
     phoneNumber?: string | null;
     priority: "L1" | "L2" | "L3";
     frequencyDays: number;
     lastContactedDays: number;
     pingTemplate?: string | null;
 };

export const fetchContacts = createAsyncThunk(
    'contacts/fetchContacts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ApiService.get('/contacts');
            const data: unknown = response.data;
            console.log(JSON.stringify(data,null,2));

            if (!Array.isArray(data)) {
                return rejectWithValue('Failed to fetch contacts');
            }

            // Map and format data as per original hook
            const formattedContacts: Contact[] = (data as ApiContact[]).map((contact) => ({
                id: contact.id,
                name: contact.name,
                description: contact.description ?? "",
                lastInteraction: contact.lastInteraction ?? "",
                profileLink: contact.profileLink ?? "",
                phoneNumber: contact.phoneNumber ?? "",
                priority: contact.priority,
                frequencyDays: contact.frequencyDays,
                lastContactedDays: contact.lastContactedDays,
                userId: contact.userId,
                pingTemplate: contact.pingTemplate ?? "",
            }));
            return formattedContacts;
        } catch (error: unknown) {
            const message =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                'Failed to fetch contacts';
            return rejectWithValue(message);
        }
    }
);

export const addContact = createAsyncThunk(
    'contacts/addContact',
    async (contactData: Omit<Contact, "id" | "userId">, { dispatch, rejectWithValue }) => {
        try {
            await ApiService.post('/contacts', contactData);
            dispatch(fetchContacts());
            return true;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add contact');
        }
    }
);

export const addContactList = createAsyncThunk(
    'contacts/addContactList',
    async (contactDataList: Omit<Contact, "id" | "userId">[], { dispatch, rejectWithValue }) => {
        try {
            await ApiService.post('/contacts', contactDataList);
            dispatch(fetchContacts());
            return true;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add contact list');
        }
    }
);

export const updateContact = createAsyncThunk(
    'contacts/updateContact',
    async ({ id, data }: { id: string; data: Partial<Contact> }, { dispatch, rejectWithValue }) => {
        try {
            await ApiService.put(`/contacts/${id}`, data);
            dispatch(fetchContacts());
            return true;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update contact');
        }
    }
);

export const deleteContact = createAsyncThunk(
    'contacts/deleteContact',
    async (id: string, { dispatch, rejectWithValue }) => {
        try {
            await ApiService.delete(`/contacts/${id}`);
            dispatch(fetchContacts());
            return true;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete contact');
        }
    }
);
