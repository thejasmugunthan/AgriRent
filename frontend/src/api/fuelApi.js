// src/api/fuelApi.js

export async function getDieselPrice(pincode) {
  try {
    const res = await fetch(
      `https://fuelprice-api-india.vercel.app/pincode/${pincode}`
    );

    const data = await res.json();

    if (!data || data.error) {
      return { diesel: 95 }; 
    }

    return {
      diesel: data.diesel || 95,
      city: data.city,
      state: data.state,
    };
  } catch (err) {
    console.log("Diesel API error:", err);
    return { diesel: 95 };
  }
}
