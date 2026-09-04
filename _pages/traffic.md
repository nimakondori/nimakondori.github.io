---
layout: page
permalink: /traffic/
title: traffic
description: Live visitor stats for this site, tracked with GoatCounter.
nav: false
---

<div class="traffic-card">
  {% if site.enable_goatcounter and site.goatcounter_code %}
    <p>
      This site's visitor traffic is tracked with
      <a href="https://www.goatcounter.com/" target="_blank" rel="noopener noreferrer">GoatCounter</a>
      — a free, open-source, cookie-less analytics tool. No personal data is collected and no
      cookie banner is needed.
    </p>
    <a
      class="btn btn-outline traffic-card__button"
      href="https://{{ site.goatcounter_code }}.goatcounter.com/"
      target="_blank"
      rel="noopener noreferrer"
    >
      View live traffic dashboard →
    </a>
  {% else %}
    <p>
      Traffic tracking isn't configured yet. Once a
      <a href="https://www.goatcounter.com/" target="_blank" rel="noopener noreferrer">GoatCounter</a>
      site code is set in <code>_config.yml</code> (<code>goatcounter_code</code>) and
      <code>enable_goatcounter</code> is turned on, live stats will link from here.
    </p>
  {% endif %}
</div>
