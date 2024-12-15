import { useState, useEffect } from "react";
import the_nut_spot_outside from "../../images/THE_NUT_SPOT_OUTSIDE.webp";
import the_nut_spot_inside from "../../images/THE_NUT_SPOT_INSIDE.webp";
import reviews from "./data/customer_reviews.json";
import "./Home.css";

function Home() {
  const [current_review_index, set_current_review_index] = useState(0);
  const [fade, set_fade] = useState(true);

  // I want to set a random review index when the component mounts
  // so we don't start each time from #1
  useEffect(() => {
    const random_index = Math.floor(
      Math.random() * reviews.customer_reviews.length
    );
    set_current_review_index(random_index);
  }, []);

  // auto-scroll reviews, fade in/out
  useEffect(() => {
    const interval = setInterval(() => {
      // starting to fade out
      set_fade(false);
      setTimeout(() => {
        set_current_review_index(
          (prevIndex) => (prevIndex + 1) % reviews.customer_reviews.length
        );
        // starting to fade in
        set_fade(true);
      }, 600);
    }, 7000);

    // when Home() unmounts, clear the interval, so it doesn't keep running
    return () => clearInterval(interval);
  }, []);

  const currentReview = reviews.customer_reviews[current_review_index];

  return (
    <>
      <section className="home_section">
        <div className="main_home_section_part1">
          <h1 className="home_section_title_1">
            Going Nuts Since 1970 - Where Every Crunch Tells a Story!
          </h1>
          <h1 className="home_section_title_1_small">
            Going Nuts Since 1970
            <br />
            Where Every Crunch Tells a Story!
          </h1>
        </div>
        {/* Section Part 2 */}
        <div className="main_home_section_part2">
          <img
            className="home_section_image_container"
            src={the_nut_spot_outside}
            alt="The Nut Spot store"
          />
          <section>
            <h1 className="home_section_title_2">
              Going Nuts Since 1970
              <br />
              Where Every Crunch Tells a Story!
            </h1>
            <p>
              Nestled in the cobblestone streets of historic downtown,{" "}
              <strong>The Nut Spot</strong> has been delighting nut lovers for
              over half a century. Founded in 1970, this charming Spot is more
              than just a store—it’s a local institution, a place where the
              aroma of freshly roasted nuts wafts through the air, and every
              visitor leaves with a smile (and often a little nut dust on their
              hands).
            </p>
            <p>
              What began as a small family business with a passion for
              perfecting the art of nut roasting has grown into a beloved
              destination for locals and tourists alike. Our philosophy is
              simple: <em>nuts about nuts.</em> We believe every almond,
              pistachio, and pecan has a story, and we’re here to make sure it’s
              a delicious one.
            </p>
          </section>
          <section>
            <p>
              Stepping inside <strong>The Nut Spot</strong> is like walking into
              a nutty wonderland. Rows of gleaming tins and rustic burlap sacks
              brim with every nut imaginable—from classic raw almonds to
              chocolate-dipped delights. The warm and inviting atmosphere,
              paired with a hint of nostalgia, makes it hard not to spend hours
              exploring our collection.
            </p>
            <p>
              Over the decades, we’ve earned a reputation for our unwavering
              dedication to quality. Each batch of nuts is carefully sourced
              from trusted growers and roasted right here in the store to ensure
              freshness and flavor. From sweet to savory, spicy to indulgent,
              our selection has something for every craving. And yes, our
              customers often say they’ve gone a little nuts trying to choose
              just one favorite!
            </p>
          </section>
          <section>
            <p>
              But it’s not just about the nuts. It’s about the stories we share
              and the memories we help create. Generations of families have made{" "}
              <strong>The Nut Spot</strong> part of their traditions, from
              holiday gift tins to everyday indulgences. We’ve celebrated
              countless milestones with our customers, whether it’s a wedding
              favor, a birthday treat, or a corporate thank-you gift.
            </p>
            <p>
              We’re also proud of our sense of humor—it’s part of the charm. Our
              motto?{" "}
              <em>“If you’re not nuts about us yet, you will be soon!”</em>{" "}
              Whether you’re here for a bag of pistachios or just a good laugh,
              we guarantee you’ll leave with something worth cracking a smile
              over.
            </p>
          </section>
          <section>
            <p>
              As we continue into our next fifty years, our mission remains the
              same: to bring joy to every crunch. Whether you’re a seasoned nut
              enthusiast or just discovering the magic of a honey-roasted
              peanut, <strong>The Nut Spot</strong> is your go-to destination
              for all things nutty.
            </p>
            <p>
              So, what are you waiting for? Come visit us and see why downtown’s
              been going nuts over <strong>The Nut Spot</strong> for decades.
              It’s not just a store; it’s an experience, a tradition, and a
              little slice of roasted heaven.
            </p>
          </section>
        </div>
        {/* reviews */}
        <div className="main_home_section_part3">
          <div className="review_container">
            <h3 className="reviews_title">Customer Reviews</h3>
            <div className={`review_wrapper fade ${fade ? "in" : "out"}`}>
              <div className="review_body">
                {currentReview.review.split("\n\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              <div className="review_author">{currentReview.name}</div>
              <div className="review_author_hometown">
                {currentReview.town_province}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
