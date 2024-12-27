// Video to help with stripe payment
// https://www.youtube.com/watch?v=2JDKquIMJws

export async function POST(req) {

}

async function fulfillCheckout(sessionId) {
  // This function comes from
  // https://docs.stripe.com/checkout/fulfillment?lang=node#create-fulfillment-function

  // Set your secret key. Remember to switch to your live secret key in production.
  // See your keys here: https://dashboard.stripe.com/apikeys

  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

  // console.log('Fulfilling Checkout Session ' + sessionId);

  // TODO: Make this function safe to run multiple times,
  // even concurrently, with the same session ID

  // TODO: Make sure fulfillment hasn't already been
  // peformed for this Checkout Session

  // Retrieve the Checkout Session from the API with line_items expanded
  // const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
  //   expand: ['line_items'],
  // });

  // Check the Checkout Session's payment_status property
  // to determine if fulfillment should be peformed
  // if (checkoutSession.payment_status !== 'unpaid') {
    // TODO: Perform fulfillment of the line items

    // TODO: Record/save fulfillment status for this
    // Checkout Session
  // }
}
