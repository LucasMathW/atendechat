import { i18n } from "../../../translate/i18n";

export default {
  formId: 'checkoutForm',
  formField: {
    firstName: {
      name: 'firstName',
      label: i18n.t('checkoutPage.form.firstName.label'),
      requiredErrorMsg: i18n.t('checkoutPage.form.firstName.required')
    },
    lastName: {
      name: 'lastName',
      label: i18n.t('checkoutPage.form.lastName.label'),
      requiredErrorMsg: i18n.t('checkoutPage.form.lastName.required')
    },
    address1: {
      name: 'address2',
      label: i18n.t('checkoutPage.form.address1.label'),
      requiredErrorMsg: i18n.t('checkoutPage.form.address1.required')
    },

    city: {
      name: 'city',
      label: i18n.t('checkoutPage.form.city.label'),
      requiredErrorMsg: i18n.t('checkoutPage.form.city.required')
    },
    state: {
      name: 'state',
      label: i18n.t('checkoutPage.form.state.label'),
      requiredErrorMsg: i18n.t('checkoutPage.form.state.required')
    },
    zipcode: {
      name: 'zipcode',
      label: i18n.t('checkoutPage.form.zipcode.label'),
      requiredErrorMsg: i18n.t('checkoutPage.form.zipcode.required'),
      invalidErrorMsg: i18n.t('checkoutPage.form.zipcode.invalid')
    },
    country: {
      name: 'country',
      label: i18n.t('checkoutPage.form.country.label'),
      requiredErrorMsg: i18n.t('checkoutPage.form.country.required')
    },
    useAddressForPaymentDetails: {
      name: 'useAddressForPaymentDetails',
      label: i18n.t('checkoutPage.form.useAddressForPaymentDetails.label')
    },
    invoiceId: {
      name: 'invoiceId',
      label: i18n.t('checkoutPage.form.invoiceId.label'),
    },
    nameOnCard: {
      name: 'nameOnCard',
      label: i18n.t('checkoutPage.form.nameOnCard.label'),
      requiredErrorMsg: i18n.t('checkoutPage.form.nameOnCard.required')
    },
    cardNumber: {
      name: 'cardNumber',
      label: i18n.t('checkoutPage.form.cardNumber.label'),
      requiredErrorMsg: i18n.t('checkoutPage.form.cardNumber.required'),
      invalidErrorMsg: i18n.t('checkoutPage.form.cardNumber.invalid')
    },
    expiryDate: {
      name: 'expiryDate',
      label: i18n.t('checkoutPage.form.expiryDate.label'),
      requiredErrorMsg: i18n.t('checkoutPage.form.expiryDate.required'),
      invalidErrorMsg: i18n.t('checkoutPage.form.expiryDate.invalid')
    },
    cvv: {
      name: 'cvv',
      label: i18n.t('checkoutPage.form.cvv.label'),
      requiredErrorMsg: i18n.t('checkoutPage.form.cvv.required'),
      invalidErrorMsg: i18n.t('checkoutPage.form.cvv.invalid')
    }
  }
};
