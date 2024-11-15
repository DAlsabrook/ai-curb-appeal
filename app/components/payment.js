"use client";
import '../styles/payments.css'
import { useUser } from './UserContext'; // Import the useUser hook


export default function PaymentPage({ setOpenAppDashboard, setOpenAppLanding, setOpenAppPayment }) {
  const { user, setUser } = useUser(); // Use the useUser hook to get user and setUser

  return (
    <div className="paymentContainer">
      <p>Payments page</p>
      {/* Stripe button import */}
      <script async src="https://js.stripe.com/v3/buy-button.js"></script>
      <stripe-buy-button
        buy-button-id="buy_btn_1PxKnS02RqCe7z2q4uHEjAnb"
        publishable-key="pk_test_51Pwx0102RqCe7z2q0HI8Hjefqi4BdSdUhzlHVQGqHuqkEB1HNP8iB79mXfCXdqpI3x8FjiXWKp2FlruSwip1yJXu006rqYEW2c">
      </stripe-buy-button>
    </div>
  )
}
