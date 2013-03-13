import os
from bs4 import BeautifulSoup

# base_url = "http://alps.io/schema.org/"
base_url = ""
output_dir = "output/"

ALPS_CLASS_BASE = """<alps>
 <descriptor id="%(label)s" type="semantic">
  <doc format="html">
   %(doc)s
  </doc>
  %(properties)s
 </descriptor>
</alps>"""

ALPS_PROPERTY_BASE = """  <descriptor id="%(label)s" type="semantic"%(href)s rt="%(rt)s">
   <doc format="html">
    %(doc)s
   </doc>
  </descriptor>
"""

def with_property(tag, property):
    return tag.find(property=property)

def all_with_property(tag, property):
    return tag.find_all(property=property)

def fix_doc(doc):
    return doc.strip()q.replace("&lt;", "<").replace("&gt;", ">")

classes = []
properties = []
classes_by_uri = {}
subclasses_by_uri = {}

class RDFClass(object):
    def __init__(self, div):
        self.uri = div['resource']
        classes_by_uri[self.uri] = self
        self.label = with_property(div, 'rdfs:label').string
        self.comment = with_property(div, 'rdfs:comment').string
        self.superclasses = []
        self.properties = []
        for superclass in all_with_property(div, 'rdfs:subClassOf'):
            superclass_uri = superclass['href']
            self.superclasses.append(superclass_uri)
            subclasses_by_uri.setdefault(superclass_uri, []).append(self)
        # TODO: dc:source

    @property
    def url(self):
        return base_url + self.label

    @property
    def as_alps(self):
        values = dict(label=self.label, doc=fix_doc(self.comment))
        values['properties'] = '\n'.join(
            p.as_alps(self) for p in self.all_properties)
        return ALPS_CLASS_BASE % values

    @property
    def all_properties(self):
        # Yield all properties defined in this class or superclasses,
        # in alphabetical order.
        unsorted = []
        for superclass_uri in self.superclasses:
            c = classes_by_uri[superclass_uri]
            unsorted.extend(list(c.all_properties))
        unsorted.extend(self.properties)
        for p in sorted(unsorted, key=lambda x: x.label):
            yield p

class RDFProperty(object):

    def __init__(self, div):
        self.domain = with_property(div, 'http://schema.org/domain')['href']
        self.domain_class = classes_by_uri[self.domain]
        self.domain_class.properties.append(self)
        self.range = with_property(div, 'http://schema.org/range')['href']
        self.range_class = classes_by_uri[self.range]
        self.comment = with_property(div, 'rdfs:comment').string
        self.label = with_property(div, 'rdfs:label').string

    @property
    def url(self):
        return self.domain_class.url + "#" + self.label

    def as_alps(self, for_class):
        values = dict(
            label=self.label,
            href="",
            rt=base_url + self.range_class.label,
            doc=fix_doc(self.comment))
        if for_class != self.domain_class:
            # This is being included in a subclass of its domain class.
            # We need to link to the original definition.
            values['href'] = ' href="%s"' % self.url
            
        return ALPS_PROPERTY_BASE % values

input = open("schema_org_rdfa.html").read()
soup = BeautifulSoup(input, "xml")
for div in soup.find_all(typeof="rdfs:Class"):
    classes.append(RDFClass(div))
for div in soup.find_all(typeof='rdf:Property'):
    properties.append(RDFProperty(div))

for c in classes:
    filename = os.path.join(output_dir, c.label)
    open(filename, 'w').write(c.as_alps.encode("utf8"))
