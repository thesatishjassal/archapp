"use client";

import { useMemo, useState } from "react";

export default function RewardsPage() {

  const [amount, setAmount] =
    useState(1000000);

  const rewardPlans = [

    {
      target: "3M",
      bonus: 20,
    },

    {
      target: "5M",
      bonus: 30,
    },

    {
      target: "7.5M",
      bonus: 50,
    },

    {
      target: "10M",
      bonus: 100,
    },

  ];

  const calculations =
    useMemo(() => {

      const baseReward =
        amount * 0.05;

      let extraBonus = 0;

      if (
        amount >= 100000000
      ) {

        extraBonus =
          baseReward;

      } else if (
        amount >= 75000000
      ) {

        extraBonus =
          baseReward * 0.5;

      } else if (
        amount >= 50000000
      ) {

        extraBonus =
          baseReward * 0.3;

      } else if (
        amount >= 30000000
      ) {

        extraBonus =
          baseReward * 0.2;

      }

      return {

        baseReward,

        extraBonus,

        total:
          baseReward +
          extraBonus,

        points:
          amount,

      };

    }, [amount]);

  return (

    <section className="rewardSlim">

      <div className="rewardSlim__container">

        {/* TOP */}

        <div className="rewardSlim__top">

          <div>

            <span className="rewardSlim__tag">
              Architect Rewards
            </span>

            <h1 className="rewardSlim__title">

              Earn More
              <br />
              With Every Project

            </h1>

          </div>

          <div className="rewardSlim__mini">

            <h3>
              5%
            </h3>

            <p>
              Base Reward
            </p>

          </div>

        </div>

        {/* CALCULATOR */}

        <div className="rewardCalc">

          <div className="rewardCalc__top">

            <div>

              <span>
                Total Order Value
              </span>

              <h2>

                ₹
                {Number(
                  amount
                ).toLocaleString()}

              </h2>

            </div>

            <div className="rewardCalc__points">

              {Number(
                calculations.points
              ).toLocaleString()}

              <span>
                Reward Points
              </span>

            </div>

          </div>

          <input
            type="range"
            min="100000"
            max="99999999"
            step="100000"
            value={amount}
            onChange={(e) =>
              setAmount(
                Number(
                  e.target.value
                )
              )
            }
            className="rewardCalc__range"
          />

          {/* RESULT */}

          <div className="rewardCalc__grid">

            <div className="rewardCalc__card">

              <span>
                Base Reward
              </span>

              <h3>

                ₹
                {Math.round(
                  calculations.baseReward
                ).toLocaleString()}

              </h3>

            </div>

            <div className="rewardCalc__card">

              <span>
                Extra Bonus
              </span>

              <h3>

                ₹
                {Math.round(
                  calculations.extraBonus
                ).toLocaleString()}

              </h3>

            </div>

            <div className="rewardCalc__card rewardCalc__card--active">

              <span>
                Total Earnings
              </span>

              <h3>

                ₹
                {Math.round(
                  calculations.total
                ).toLocaleString()}

              </h3>

            </div>

          </div>

        </div>

        {/* SLIM TABLE */}

        <div className="rewardLevels">

          {rewardPlans.map(
            (item,index) => (

<div
  key={index}
  className={`rewardLevels__row ${
    amount >=
    (
      item.target === "3M"
        ? 30000000
        : item.target === "5M"
        ? 50000000
        : item.target === "7.5M"
        ? 75000000
        : 100000000
    )
      ? "active"
      : ""
  }`}
>

                <div>

                  <h4>
                    {item.target}
                  </h4>

                  <p>
                    Target
                  </p>

                </div>

                <div>

                  <h4>
                    +{item.bonus}%
                  </h4>

                  <p>
                    Extra Reward
                  </p>

                </div>

              </div>

            )
          )}

        </div>

      </div>

    </section>

  );

}