function createHomeEventCard(event) {

    const card =
        document.createElement("article");


    card.className =
        "home-event-card";


    const imageUrl =
        event.imageUrl ||
        "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80";


    const eventDate =
        new Date(event.eventDate);


    const month =
        eventDate
            .toLocaleString(
                "en-US",
                {
                    month: "short"
                }
            )
            .toUpperCase();


    const day =
        eventDate.getDate();


    const formattedDate =
        formatHomeEventDate(
            event.eventDate
        );


    const formattedTime =
        formatHomeEventTime(
            event.startTime
        );


    card.innerHTML = `

        <div class="home-event-image-wrapper">

            <img
                src="${imageUrl}"
                alt="${escapeHomeHtml(event.name || "Event")}"
                class="home-event-image"
            >

            <span class="home-event-category">
                ${escapeHomeHtml(
                    event.categoryName || "Event"
                )}
            </span>

            <div class="home-event-date">
                <span>${month}</span>
                <strong>${day}</strong>
            </div>

        </div>


        <div class="home-event-content">

            <h3>
                ${escapeHomeHtml(
                    event.name || "Unnamed Event"
                )}
            </h3>


            <div class="home-event-info">

                <p>
                    📅 ${formattedDate}
                    • ${formattedTime}
                </p>

                <p>
                    📍 ${escapeHomeHtml(
                        event.venueName || "Venue unavailable"
                    )}
                </p>

            </div>


            <div class="home-event-footer">

                <div>

                    <small>
                        Ticket Price
                    </small>

                    <strong>
                        LKR ${Number(
                            event.ticketPrice || 0
                        ).toLocaleString(
                            "en-LK",
                            {
                                minimumFractionDigits: 2
                            }
                        )}
                    </strong>

                </div>


                <a
                    href="pages/customer/event-details.html?id=${event.id}"
                    class="btn btn-primary"
                >
                    View Event
                </a>

            </div>

        </div>
    `;


    return card;
}