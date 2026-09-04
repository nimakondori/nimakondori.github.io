---
layout: page
permalink: /traffic/
title: Traffic
description: Live visitor stats for this site, tracked with GoatCounter.
---

<div class="traffic-card">
  {% if site.enable_goatcounter and site.goatcounter_code %}
    <p>
      This site's traffic is tracked with
      <a href="https://www.goatcounter.com/" target="_blank" rel="noopener noreferrer">GoatCounter</a>
      — free, open-source, cookie-less analytics. No personal data is collected and no cookie
      banner is needed.
    </p>
    <a
      class="btn btn--ghost"
      href="https://{{ site.goatcounter_code }}.goatcounter.com/"
      target="_blank"
      rel="noopener noreferrer"
      data-magnetic
    >
      View live dashboard ↗
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
