import { useEffect, useCallback } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { Contact } from "@/lib/features/contacts/contactsSlice"
import {
    fetchContacts,
    addContact as addContactAction,
    addContactList as addContactListAction,
    updateContact as updateContactAction,
    deleteContact as deleteContactAction
} from "@/lib/features/contacts/contactsThunk"

export type { Contact }

export function useContacts(user: any) { // user type from session
    const dispatch = useAppDispatch()
    const { contacts, loading } = useAppSelector((state) => state.contacts)

    const refreshContacts = useCallback(() => {
        if (user) {
            dispatch(fetchContacts())
        }
    }, [dispatch, user])

    useEffect(() => {
        refreshContacts()
    }, [refreshContacts])

    const addContact = async (data: Omit<Contact, "id" | "userId">) => {
        try {
            await dispatch(addContactAction(data)).unwrap()
            return true
        } catch (error) {
            console.error("Error adding contact:", error)
            return false
        }
    }

    const addContactList = async (data: Omit<Contact, "id" | "userId">[]) => {
        try {
            await dispatch(addContactListAction(data)).unwrap()
            return true
        } catch (error) {
            console.error("Error adding contact list:", error)
            return false
        }
    }

    const updateContact = async (id: string, data: Partial<Contact>) => {
        try {
            await dispatch(updateContactAction({ id, data })).unwrap()
            return true
        } catch (error) {
            console.error("Error updating contact:", error)
            return false
        }
    }

    const deleteContact = async (id: string) => {
        try {
            await dispatch(deleteContactAction(id)).unwrap()
            return true
        } catch (error) {
            console.error("Error deleting contact:", error)
            return false
        }
    }

    return {
        contacts,
        loading,
        addContact,
        addContactList,
        updateContact,
        deleteContact,
        refreshContacts
    }
}
