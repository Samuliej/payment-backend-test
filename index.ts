import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import Stripe from 'stripe';

// Load environment variables
dotenv.config();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);


// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

interface PaymentIntentRequest {
  amount: number;
}

app.post('/create-payment-intent', async (req: Request<{}, {}, PaymentIntentRequest>, res: Response) => {
  const { amount } = req.body;
  console.log(`amount ${amount}`)
  const amountInDollars = (amount / 100).toFixed(2);
  
  console.log(`New payment request received at ${new Date().toISOString()}`);
  console.log(`Amount: $${amountInDollars} (${amount} cents)`);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method_types: ['card'],
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error('Payment failed:', error.message);
    res.status(500).send({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
