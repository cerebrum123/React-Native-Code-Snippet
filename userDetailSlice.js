import { createSlice } from "@reduxjs/toolkit";

const userDetailSlice = createSlice({
    name: 'userDetails',
    initialState: {
        updateBusiness: {
            shortDescription: '',
            locationLink: '',
            addressLine1: '',
            addressLine2: '',
            pageTitle: '',
            supportMobile: '',
            supportEmail_id: '',
            imageLogo: '',
            imageFirm: '',
            fromDate: '',
            today: '',
            workingTime: '',
            holiday: '',
            mobile1: '',
            mobile2: '',
            mobile3: '',
            emailId1: '',
            emailId2: '',
        },
        previewBusiness:
        {
            email: '',
            password: '',
            mobile_number: '',
            partner_name: '',
            region: '',
            state: '',
            city: '',
            postal_code: '',
            gst_id: '',
        }
    },



    reducers: {
        updateUserDetails: (state, action) => {
            state.updateBusiness = { ...state.updateBusiness, ...action.payload }
        },

        previewBusinessDetails: (state, action) => {
            state.previewBusiness = { ...state.previewBusiness, ...action.payload }
        },
    }
})

export const { updateUserDetails, previewBusinessDetails } = userDetailSlice.actions;
export default userDetailSlice.reducer;
