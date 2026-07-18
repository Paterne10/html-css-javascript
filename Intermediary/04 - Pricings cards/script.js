let yearly = false;

const pricingGrid = document.getElementById("pricing-grid");
const testimonialGrid = document.getElementById("testimonial-grid");
const billingSwitch = document.getElementById("billing-switch");
const labelMonthly = document.getElementById("label-monthly");
const labelYearly = document.getElementById("label-yearly");

function renderPlans() {
  pricingGrid.innerHTML = PLANS.map((plan) => {
    const price = yearly ? plan.yearly : plan.monthly;
    const period = price === 0 ? "" : `/mo${yearly ? ", billed yearly" : ""}`;

    return `
      <div class="price-card ${plan.featured ? "featured" : ""}">
        ${plan.featured ? '<span class="featured-badge">Most popular</span>' : ""}
        <p class="plan-name">${plan.name}</p>
        <p class="plan-desc">${plan.desc}</p>
        <div class="plan-price">
          <span class="plan-amount">$${price}</span>
          <span class="plan-period">${period}</span>
        </div>
        <ul class="plan-features">
          ${plan.features.map((f) => `<li><span class="plan-check">✓</span>${f}</li>`).join("")}
        </ul>
        <button class="plan-cta ${plan.featured ? "primary" : ""}" type="button">${plan.cta}</button>
      </div>
    `;
  }).join("");
}


function renderTestimonials() {
  testimonialGrid.innerHTML = TESTIMONIALS.map((t) => {
    const starString = "★".repeat(t.stars) + "☆".repeat(5 - t.stars);
    return `
      <div class="testimonial-card">
        <div class="stars">${starString}</div>
        <p class="testimonial-quote">${t.quote}</p>
        <div class="testimonial-person">
          <div class="avatar" style="background:${t.color};">${t.initials}</div>
          <div>
            <p class="person-name">${t.name}</p>
            <p class="person-role">${t.role}</p>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

billingSwitch.addEventListener("click", () => {
  yearly = !yearly;
  billingSwitch.classList.toggle("on", yearly);
  labelMonthly.classList.toggle("active", !yearly);
  labelYearly.classList.toggle("active", yearly);
  renderPlans();
});

renderPlans();
renderTestimonials();
