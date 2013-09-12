<?xml version="1.0"?>
<!-- produce documentation -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html" />

<xsl:template match="/">
    <html>
        <head>
            <title>Documentation</title>
        </head>
        <body>
            <h1>Documentation</h1>
            <xsl:copy-of select="//alps/doc" disable-output-escaping="yes"/>
            <xsl:if test="count(//alps/link)&gt;0">
                <ul class="link">
                    <xsl:for-each select="//alps/link">
                        <li>rel:<xsl:value-of select="@rel" /> = <a href="{@href}" rel="{@rel}"><xsl:value-of select="@href" /></a></li>
                    </xsl:for-each>
                </ul>
            </xsl:if>
            <xsl:apply-templates select="*" /> <!--|@*|text()"/>-->
        </body>
    </html>
</xsl:template>

<xsl:template name="call-link">
    <ul class="link">
        <xsl:for-each select="link">
            <li>rel:<xsl:value-of select="@rel" /> = <a href="{@href}" rel="{@rel}"><xsl:value-of select="@href" /></a></li>
        </xsl:for-each>
    </ul>
</xsl:template>

<xsl:template match="descriptor">
  <div class="descriptor">
      <h4 class="id" id="{@id}"><xsl:value-of select="@id" /></h4>
    <xsl:if test="count(doc)&gt;0">
      <xsl:copy-of select="doc" disable-output-escaping="yes"/>
    </xsl:if>
    <xsl:if test="count(link)&gt;0">
        <xsl:call-template name="call-link" />
    </xsl:if>
    <ul class="attributes">
        <xsl:for-each select="@*">
          <xsl:choose>
            <xsl:when test="contains(.,'#')">
              <li><xsl:value-of select="name()" /> : <a href="{.}"><xsl:value-of select="." /></a></li>
            </xsl:when>
            <xsl:when test="name()='href'">i
              <li><xsl:value-of select="name()" /> : <a href="{.}"><xsl:value-of select="." /></a></li>
            </xsl:when>
            <xsl:otherwise>
              <li><xsl:value-of select="name()" /> : <xsl:value-of select="." /></li>
            </xsl:otherwise>  
          </xsl:choose>
      </xsl:for-each>
      <xsl:if test="count(contains)&gt;0">
        <li>Contains: <xsl:apply-templates select="*"/></li>
      </xsl:if>
      <xsl:if test="count(property)&gt;0">
          <li>Properties: <xsl:apply-templates select="*" /></li>
      </xsl:if>
      <xsl:if test="count(descriptor)&gt;0">
          <li>Contains: <xsl:apply-templates select="*" /></li>
      </xsl:if>
    </ul>
  </div>
</xsl:template>

<xsl:template match="property">
  <div class="property">
      <h4 class="id" id="{@id}"><xsl:value-of select="@id" /></h4>
    <xsl:if test="count(doc)&gt;0">
      <xsl:copy-of select="doc" disable-output-escaping="yes"/>
    </xsl:if>
    <xsl:if test="count(link)&gt;0">
        <xsl:call-template name="call-link" />
    </xsl:if>
    <ul class="attributes">
        <xsl:for-each select="@*">
          <xsl:choose>
            <xsl:when test="contains(.,'#')">
              <li><xsl:value-of select="name()" /> : <a href="{.}"><xsl:value-of select="." /></a></li>
            </xsl:when>
            <xsl:when test="name()='href'">i
              <li><xsl:value-of select="name()" /> : <a href="{.}"><xsl:value-of select="." /></a></li>
            </xsl:when>
            <xsl:otherwise>
              <li><xsl:value-of select="name()" /> : <xsl:value-of select="." /></li>
            </xsl:otherwise>  
          </xsl:choose>
      </xsl:for-each>
    </ul>
  </div>
</xsl:template>


<xsl:template match="contains">
  <div class="contains">
      <h4 class="id" id="{@id}"><xsl:value-of select="@id" /></h4>
    <xsl:if test="count(doc)&gt;0">
      <xsl:copy-of select="doc" disable-output-escaping="yes"/>
    </xsl:if>
    <xsl:if test="count(link)&gt;0">
        <xsl:call-template name="call-link" />
    </xsl:if>
    <ul class="attributes">
        <xsl:for-each select="@*">
          <xsl:choose>
            <xsl:when test="contains(.,'#')">
              <li><xsl:value-of select="name()" /> : <a href="{.}"><xsl:value-of select="." /></a></li>
            </xsl:when>
            <xsl:when test="name()='href'">i
              <li><xsl:value-of select="name()" /> : <a href="{.}"><xsl:value-of select="." /></a></li>
            </xsl:when>
            <xsl:otherwise>
              <li><xsl:value-of select="name()" /> : <xsl:value-of select="." /></li>
            </xsl:otherwise>  
          </xsl:choose>
      </xsl:for-each>
    </ul>
  </div>
</xsl:template>


<xsl:template match="doc">
  <!-- to catch (and not display) doc elements -->
</xsl:template>

</xsl:stylesheet>
