import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  photo?: string;
  customerId?: string;
  enrollmentId?: string;
  biometricStatus?: string;
  idmissionValid?: boolean;
  enrollmentStatus?: string;
}

interface AuthState {
  registrationData: RegistrationData | null;
  isRegistered: boolean;
}

const initialState: AuthState = {
  registrationData: null,
  isRegistered: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setRegistrationData: (state, action: PayloadAction<RegistrationData>) => {
      state.registrationData = action.payload;
      state.isRegistered = true;
    },
    setPhoto: (state, action: PayloadAction<string>) => {
      if (state.registrationData) {
        state.registrationData.photo = action.payload;
      } else {
        // Create basic registration data if it doesn't exist
        state.registrationData = {
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          photo: action.payload,
        };
      }
    },
    setUploadedPhotoUrl: (state, action: PayloadAction<string>) => {
      if (state.registrationData) {
        state.registrationData.photo = action.payload;
      }
    },
    setBiometricEnrollmentData: (state, action: PayloadAction<{
      customerId: string;
      enrollmentId: string;
      biometricStatus: string;
      idmissionValid: boolean;
    }>) => {
      if (state.registrationData) {
        state.registrationData.customerId = action.payload.customerId;
        state.registrationData.enrollmentId = action.payload.enrollmentId;
        state.registrationData.biometricStatus = action.payload.biometricStatus;
        state.registrationData.idmissionValid = action.payload.idmissionValid;
      }
    },
    updateEnrollmentStatus: (state, action: PayloadAction<string>) => {
      if (state.registrationData) {
        state.registrationData.enrollmentStatus = action.payload;
      }
    },
    clearRegistrationData: (state) => {
      state.registrationData = null;
      state.isRegistered = false;
    },
  },
});

export const { setRegistrationData, setPhoto, setUploadedPhotoUrl, setBiometricEnrollmentData, updateEnrollmentStatus, clearRegistrationData } = authSlice.actions;
export default authSlice.reducer;
