import React from 'react';
import { Typography, Grid } from '@material-ui/core';
import useStyles from './styles';
import { i18n } from '../../../translate/i18n';

function PaymentDetails(props) {
  const { formValues } = props;
  const classes = useStyles();
  const { plan } = formValues;

  const newPlan = JSON.parse(plan);
  const { users, connections, price } = newPlan;
  return (
    <Grid item xs={12} sm={12}>
      <Typography variant="h6" gutterBottom className={classes.title}>
        {i18n.t('checkoutPage.review.details')}
      </Typography>
      <Typography gutterBottom>{i18n.t('checkoutPage.review.users')}: {users}</Typography>
      <Typography gutterBottom>{i18n.t('checkoutPage.review.whatsapp')}: {connections}</Typography>
      <Typography gutterBottom>{i18n.t('checkoutPage.review.charges')}</Typography>
      <Typography gutterBottom>{i18n.t('checkoutPage.review.total')}: R${price.toLocaleString('pt-br', {minimumFractionDigits: 2})}</Typography>
    </Grid>
  );
}

export default PaymentDetails;
