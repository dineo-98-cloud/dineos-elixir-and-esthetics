
document.addEventListener("DOMContentLoaded", function () {

  // SUPABASE CONNECTION
  const SUPABASE_URL = "https://nrsendhixlgctmtrukwr.supabase.co";
  const SUPABASE_KEY = "sb_publishable_F896Ih6lYHa-M7yGdIE2cg_iIdESYRM";


  // 1. PAGE ANIMATIONS
  const animatedItems = document.querySelectorAll(
      ".home-services, .services-page, .page-banner, .service-box, .service-card, .booking-page, .contact-page"
  );

  animatedItems.forEach(function (item, index) {
      item.style.opacity = "0";
      item.style.transform = "translateY(20px)";

      setTimeout(function () {
          item.style.transition = "all 0.7s ease";
          item.style.opacity = "1";
          item.style.transform = "translateY(0)";
      }, index * 120);
  });


  // 2. CATEGORY MENUS
  document.querySelectorAll(".category-button").forEach(function (button) {
      button.addEventListener("click", function () {

          const content = button.nextElementSibling;

          if (!content || !content.classList.contains("category-content")) {
              return;
          }

          const isOpen = content.classList.contains("show");

          document.querySelectorAll(".category-content").forEach(function (item) {
              item.classList.remove("show");
          });

          document.querySelectorAll(".category-button").forEach(function (item) {
              item.classList.remove("selected");
          });

          if (!isOpen) {
              content.classList.add("show");
              button.classList.add("selected");
          }
      });
  });


  // 3. BUTTON CLICK EFFECTS
  document.querySelectorAll("button, .book-button, .hero-button").forEach(function (button) {
      button.addEventListener("click", function () {
          button.classList.add("clicked");

          setTimeout(function () {
              button.classList.remove("clicked");
          }, 200);
      });
  });


  // 4. FORM VALIDATION AND AJAX
  const forms = document.querySelectorAll(".validated-form");

  forms.forEach(function (form) {

      form.addEventListener("submit", async function (event) {

          event.preventDefault();

          if (!form.checkValidity()) {
              form.reportValidity();
              return;
          }

          const email = form.querySelector('input[type="email"]');
          const phone = form.querySelector('input[type="tel"]');
          const date = form.querySelector('input[type="date"]');

          // EMAIL VALIDATION
          if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
              alert("Please enter a valid email address.");
              email.focus();
              return;
          }

          // PHONE VALIDATION
          if (phone && !/^\+?[0-9\s()-]{9,15}$/.test(phone.value.trim())) {
              alert("Please enter a valid phone number.");
              phone.focus();
              return;
          }

          // DATE VALIDATION
          const today = new Date();
          const localToday = new Date(
              today.getTime() - today.getTimezoneOffset() * 60000
          ).toISOString().split("T")[0];

          if (date && date.value < localToday) {
              alert("Please choose today or a future appointment date.");
              date.focus();
              return;
          }

          // CREATE FORM MESSAGE
          let message = form.querySelector(".form-message");

          if (!message) {
              message = document.createElement("p");
              message.className = "form-message";
              form.appendChild(message);
          }

          const submitButton = form.querySelector('button[type="submit"]');

          if (!submitButton) {
              message.textContent = "Submit button not found.";
              return;
          }

          const originalText = submitButton.textContent;

          submitButton.disabled = true;
          submitButton.textContent = "Sending...";
          message.textContent = "Sending your information...";
          message.style.color = "#78504b";


          try {

              // 5. BOOKING FORM: SAVE TO SUPABASE
              if (form.dataset.formType === "booking") {

                  const formData = new FormData(form);

                  const bookingData = {
                      customer_name: formData.get("name"),
                      email: formData.get("email"),
                      phone: formData.get("phone"),
                      service: formData.get("service"),
                      selected_items: formData.get("selected_items") || "",
                      total_amount: Number(formData.get("total_amount") || 0),
                      appointment_date: formData.get("date"),
                      appointment_time: formData.get("time"),
                      payment_method: formData.get("payment_method"),
                      message: formData.get("message") || ""
                  };

                  const response = await fetch(
                      SUPABASE_URL + "/rest/v1/bookings",
                      {
                          method: "POST",
                          headers: {
                              "Content-Type": "application/json",
                              "apikey": SUPABASE_KEY,
                              "Prefer": "return=minimal"
                          },
                          body: JSON.stringify(bookingData)
                      }
                  );

                  if (!response.ok) {
                      const errorDetails = await response.text();
                      throw new Error(errorDetails || "Booking could not be saved.");
                  }

                  message.textContent =
                      "✓ Your booking request has been saved successfully! Thank you for choosing Dineo's Elixir & Esthetics.";

                  message.style.color = "green";

                  // CLEAR SAVED SERVICE SELECTIONS
                  localStorage.removeItem("deeBookingSelections");

                  const selectedItems = document.getElementById("selectedItems");
                  const bookingTotal = document.getElementById("bookingTotal");

                  if (selectedItems) {
                      selectedItems.innerHTML =
                          "<p>Your booking has been submitted successfully.</p>";
                  }

                  if (bookingTotal) {
                      bookingTotal.style.display = "none";
                  }

                  form.reset();

              } else {

                  // OTHER FORMS: TEST AJAX SUBMISSION
                  const response = await fetch(
                      "https://jsonplaceholder.typicode.com/posts",
                      {
                          method: "POST",
                          headers: {
                              "Content-Type": "application/json"
                          },
                          body: JSON.stringify({
                              formType: form.dataset.formType || "general",
                              formData: Object.fromEntries(
                                  new FormData(form).entries()
                              )
                          })
                      }
                  );

                  if (!response.ok) {
                      throw new Error("Submission failed.");
                  }

                  await response.json();

                  message.textContent =
                      "Your test AJAX submission was received. This form is not connected to permanent storage yet.";

                  message.style.color = "green";

                  form.reset();
              }

          } catch (error) {

              console.error("AJAX error:", error);

              message.textContent =
                  "Sorry, your information could not be submitted. Error: " + error.message;

              message.style.color = "red";

          } finally {

              submitButton.disabled = false;
              submitButton.textContent = originalText;

          }

      });

  });

});
